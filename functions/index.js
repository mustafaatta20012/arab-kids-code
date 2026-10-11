const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/**
 * Helper: Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "_");
}

/**
 * Callable Function: Create a new student account (Teacher Auth Required)
 */
exports.createStudentAccount = functions.https.onCall(async (data, context) => {
  // Enforce Teacher Authorization via Custom Claims
  if (!context.auth || !context.auth.token || !context.auth.token.teacher) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "⚠️ فقط المعلم المصرح له يمكنه إضافة حسابات للطلاب."
    );
  }

  const studentName = (data.studentName || "").trim();
  const password = (data.password || "").trim();
  const parentName = (data.parentName || "").trim();

  if (!studentName || !password) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "⚠️ يرجى كتابة اسم الطالب وكلمة السر."
    );
  }

  if (password.length < 4) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "⚠️ كلمة السر يجب ألا تقل عن 4 أحرف/أرقام."
    );
  }

  const studentSlug = sanitizeString(studentName);
  const syntheticEmail = `student_${studentSlug}_${Date.now().toString().slice(-4)}@student.arabkidscode.local`;

  try {
    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: syntheticEmail,
      password: password,
      displayName: studentName,
    });

    // Initialize Student Firestore document
    const studentRef = db.collection("students").doc(userRecord.uid);
    const studentData = {
      uid: userRecord.uid,
      studentName: studentName,
      syntheticEmail: syntheticEmail,
      parentName: parentName || studentName,
      unlockedLessons: [1], // Lesson 1 free by default
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
      passPlain: password, // For teacher table display masked by default
    };

    await studentRef.set(studentData);

    return {
      success: true,
      uid: userRecord.uid,
      syntheticEmail: syntheticEmail,
      message: `تم إنشاء حساب الطالب (${studentName}) بنجاح!`,
    };
  } catch (error) {
    console.error("Error creating student account:", error);
    throw new functions.https.HttpsError(
      "internal",
      `حدث خطأ في إنشاء الحساب: ${error.message}`
    );
  }
});

/**
 * Callable Function: Reset/Update Student Password (Teacher Auth Required)
 */
exports.resetStudentPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.teacher) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "⚠️ فقط المعلم المصرح له يمكنه تغيير كلمات السر."
    );
  }

  const { studentUid, newPassword } = data;
  if (!studentUid || !newPassword || newPassword.length < 4) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "⚠️ بيانات غير صحيحة أو كلمة السر قصيرة."
    );
  }

  try {
    await auth.updateUser(studentUid, { password: newPassword });
    await db.collection("students").doc(studentUid).update({
      passPlain: newPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "تم تحديث كلمة السر بنجاح!" };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Callable Function: Rate-limited Teacher Login verification
 */
exports.teacherLoginRateLimited = functions.https.onCall(async (data, context) => {
  const callerIp = context.rawRequest.ip || "unknown_ip";
  const attemptsRef = db.collection("auth_attempts").doc(callerIp);
  const now = Date.now();

  const attemptsDoc = await attemptsRef.get();
  if (attemptsDoc.exists) {
    const attemptData = attemptsDoc.data();
    if (attemptData.lockUntil && attemptData.lockUntil > now) {
      const remainingSecs = Math.ceil((attemptData.lockUntil - now) / 1000);
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `⚠️ تم تجاوز المحاولات المسموح بها! يرجى الانتظار ${remainingSecs} ثانية.`
      );
    }
  }

  // Record attempt
  let currentCount = attemptsDoc.exists ? (attemptsDoc.data().count || 0) + 1 : 1;
  let lockUntil = 0;
  if (currentCount >= 5) {
    lockUntil = now + 60000; // 60s cooldown
    currentCount = 0;
  }

  await attemptsRef.set({ count: currentCount, lockUntil: lockUntil, lastAttempt: now }, { merge: true });

  return { allowed: true };
});

/**
 * One-time setup: Assign Teacher Custom Claim to an email
 */
exports.assignTeacherRole = functions.https.onCall(async (data, context) => {
  const targetEmail = (data.email || "").trim();
  const secretKey = (data.secretKey || "").trim();

  // Protect bootstrap setup with environment secret or master key
  if (secretKey !== "arab_kids_code_master_bootstrap_2026") {
    throw new functions.https.HttpsError("permission-denied", "مفتاح غير صحيح.");
  }

  try {
    const user = await auth.getUserByEmail(targetEmail);
    await auth.setCustomUserClaims(user.uid, { teacher: true, admin: true });
    return { success: true, message: `تم ترفيع الحساب (${targetEmail}) إلى معلم بنجاح!` };
  } catch (err) {
    throw new functions.https.HttpsError("not-found", "لم يتم العثور على الحساب.");
  }
});

/**
 * Callable Function: Approve pending testimonial (Teacher Auth Required)
 */
exports.approveTestimonial = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.teacher) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "⚠️ فقط المعلم المصرح له يمكنه الموافقة على التقييمات."
    );
  }

  const { docId } = data;
  if (!docId) {
    throw new functions.https.HttpsError("invalid-argument", "معرف التقييم غير موجود.");
  }

  const pendingRef = db.collection("testimonials_pending").doc(docId);
  const pendingSnap = await pendingRef.get();

  if (!pendingSnap.exists) {
    throw new functions.https.HttpsError("not-found", "التقييم غير موجود.");
  }

  const reviewData = pendingSnap.data();
  reviewData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
  reviewData.approvedBy = context.auth.uid;

  // Publish to public testimonials collection
  await db.collection("testimonials").doc(docId).set(reviewData);
  // Delete from pending
  await pendingRef.delete();

  return { success: true, message: "تمت الموافقة ونشر التقييم بنجاح! 🎉" };
});

/**
 * Firestore Trigger: Send notification on new lead capture or student creation
 */
exports.notifyOnNewLead = functions.firestore
  .document("leads/{leadId}")
  .onCreate(async (snap, context) => {
    const leadData = snap.data();
    const parentName = leadData.parentName || "ولي أمر جديد";
    const phone = leadData.whatsappPhone || "بدون رقم";

    console.log(`🔔 NEW LEAD CAPTURED: Parent: ${parentName}, Phone: ${phone}`);

    // Store notification record for teacher dashboard
    await db.collection("teacher_notifications").add({
      type: "new_lead",
      title: `✨ عميل محتمل جديد: ${parentName}`,
      message: `قام ${parentName} (واتساب: ${phone}) ببدء التجربة المجانية للحصة الأولى.`,
      phone: phone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    return null;
  });

import { Parent, Progress, Student } from '../models';
import { EmailService } from '../modules/notifications/email.service';

/**
 * Scheduled Worker to compute weekly learning progress and send email summary to parents.
 */
export const runWeeklyParentReportJob = async (): Promise<number> => {
  console.log('⏰ Starting Weekly Parent Progress Report Job...');
  let sentCount = 0;

  try {
    const parents = await Parent.find().populate({
      path: 'userId',
      select: 'name email',
    });

    for (const parent of parents) {
      const parentUser = (parent as any).userId;
      if (!parentUser || !parentUser.email) continue;

      const children = await Student.find({ parentId: parent._id });
      for (const child of children) {
        const completedCount = await Progress.countDocuments({
          studentId: child._id,
          status: 'completed',
        });

        await EmailService.sendWeeklyProgressReportEmail(
          parentUser.email,
          parentUser.name,
          child.displayName,
          completedCount,
          child.xp,
          child.streakDays,
        );
        sentCount++;
      }
    }

    console.log(`✅ Weekly Parent Progress Report Job completed. Sent ${sentCount} reports.`);
    return sentCount;
  } catch (error) {
    console.error('❌ Weekly Parent Progress Report Job failed:', error);
    return 0;
  }
};

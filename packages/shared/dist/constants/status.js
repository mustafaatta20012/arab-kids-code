"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.ReviewStatus = exports.LessonProgressStatus = exports.SubscriptionStatus = void 0;
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["PENDING"] = "pending";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var LessonProgressStatus;
(function (LessonProgressStatus) {
    LessonProgressStatus["NOT_STARTED"] = "not_started";
    LessonProgressStatus["IN_PROGRESS"] = "in_progress";
    LessonProgressStatus["COMPLETED"] = "completed";
})(LessonProgressStatus || (exports.LessonProgressStatus = LessonProgressStatus = {}));
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["PENDING"] = "pending";
    ReviewStatus["APPROVED"] = "approved";
    ReviewStatus["REJECTED"] = "rejected";
})(ReviewStatus || (exports.ReviewStatus = ReviewStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCESSFUL"] = "successful";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=status.js.map
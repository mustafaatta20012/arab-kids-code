"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSubmissionSchema = exports.QuizSubmissionSchema = exports.ProgressUpdateSchema = void 0;
const zod_1 = require("zod");
exports.ProgressUpdateSchema = zod_1.z.object({
    watchedSeconds: zod_1.z.number().nonnegative(),
    isCompleted: zod_1.z.boolean().optional(),
});
exports.QuizSubmissionSchema = zod_1.z.object({
    answers: zod_1.z.array(zod_1.z.object({
        questionIndex: zod_1.z.number().int().nonnegative(),
        selectedOption: zod_1.z.number().int().nonnegative(),
    })),
});
exports.ProjectSubmissionSchema = zod_1.z.object({
    scratchLink: zod_1.z.string().url('رابط مشروع سكراتش غير صحيح').optional(),
    fileAssetId: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(500).optional(),
}).refine((data) => data.scratchLink || data.fileAssetId, {
    message: 'يرجى إرفاق رابط المشروع أو الملف',
});
//# sourceMappingURL=lesson.js.map
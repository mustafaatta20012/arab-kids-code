import { z } from 'zod';

export const ProgressUpdateSchema = z.object({
  watchedSeconds: z.number().nonnegative(),
  isCompleted: z.boolean().optional(),
});

export type ProgressUpdateInput = z.infer<typeof ProgressUpdateSchema>;

export const QuizSubmissionSchema = z.object({
  answers: z.array(
    z.object({
      questionIndex: z.number().int().nonnegative(),
      selectedOption: z.number().int().nonnegative(),
    }),
  ),
});

export type QuizSubmissionInput = z.infer<typeof QuizSubmissionSchema>;

export const ProjectSubmissionSchema = z.object({
  scratchLink: z.string().url('رابط مشروع سكراتش غير صحيح').optional(),
  fileAssetId: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.scratchLink || data.fileAssetId, {
  message: 'يرجى إرفاق رابط المشروع أو الملف',
});

export type ProjectSubmissionInput = z.infer<typeof ProjectSubmissionSchema>;

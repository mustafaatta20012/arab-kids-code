import { z } from 'zod';
export declare const ProgressUpdateSchema: z.ZodObject<{
    watchedSeconds: z.ZodNumber;
    isCompleted: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    watchedSeconds: number;
    isCompleted?: boolean | undefined;
}, {
    watchedSeconds: number;
    isCompleted?: boolean | undefined;
}>;
export type ProgressUpdateInput = z.infer<typeof ProgressUpdateSchema>;
export declare const QuizSubmissionSchema: z.ZodObject<{
    answers: z.ZodArray<z.ZodObject<{
        questionIndex: z.ZodNumber;
        selectedOption: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        questionIndex: number;
        selectedOption: number;
    }, {
        questionIndex: number;
        selectedOption: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    answers: {
        questionIndex: number;
        selectedOption: number;
    }[];
}, {
    answers: {
        questionIndex: number;
        selectedOption: number;
    }[];
}>;
export type QuizSubmissionInput = z.infer<typeof QuizSubmissionSchema>;
export declare const ProjectSubmissionSchema: z.ZodEffects<z.ZodObject<{
    scratchLink: z.ZodOptional<z.ZodString>;
    fileAssetId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    scratchLink?: string | undefined;
    fileAssetId?: string | undefined;
    notes?: string | undefined;
}, {
    scratchLink?: string | undefined;
    fileAssetId?: string | undefined;
    notes?: string | undefined;
}>, {
    scratchLink?: string | undefined;
    fileAssetId?: string | undefined;
    notes?: string | undefined;
}, {
    scratchLink?: string | undefined;
    fileAssetId?: string | undefined;
    notes?: string | undefined;
}>;
export type ProjectSubmissionInput = z.infer<typeof ProjectSubmissionSchema>;
//# sourceMappingURL=lesson.d.ts.map
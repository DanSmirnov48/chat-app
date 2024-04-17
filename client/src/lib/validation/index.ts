import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 100 characters." }),
    email: z.string().email(),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirm: z.string().min(8, { message: "Password must be at least 8 characters." })
}).refine((data) => {
    return data.password === data.passwordConfirm;
}, {
    message: "Password do not match",
    path: ["passwordConfirm"]
});

export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const NewMessageValidation = z.object({
    content: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 100 characters." }),
});
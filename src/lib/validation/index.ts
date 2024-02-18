import * as z from "zod";

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "To short" }),
  username: z.string().min(2, { message: "To short" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Passwords must be at least 8 characters." }),
});


export const SigninValidation = z.object({ 
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Passwords must be at least 8 characters." }),
});


import React, { forwardRef } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const messageBoxVariants = cva(
    "p-2 rounded-lg",
    {
        variants: {
            align: {
                self: "col-start-4 col-end-13 p-0",
                other: "col-start-1 col-end-10 p-0",
            },
            avatar: {
                self: "flex items-center justify-start flex-row-reverse",
                other: "flex flex-row items-center",
            },
            textStyle: {
                self: "relative mr-3 bg-indigo-100",
                other: "relative ml-3 bg-white",
            },
        },
    }
);

interface MessageBoxProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof messageBoxVariants> {
    text: string;
    isSelf: boolean;
    userInitial?: string;
}

const MessageBox = forwardRef<HTMLDivElement, MessageBoxProps>(
    ({ className, text, isSelf, userInitial = "A", ...props }, ref) => {
        return (
            <div
                className={cn(messageBoxVariants({ align: isSelf ? "self" : "other", ...props }), className)}
                ref={ref}
                {...props}
            >
                <div className={(messageBoxVariants({ avatar: isSelf ? "self" : "other" }))}>
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                        {userInitial}
                    </div>
                    <div className={cn("relative text-sm py-2 px-4 shadow rounded-xl", messageBoxVariants({ textStyle: isSelf ? "self" : "other" }))}>
                        <div>{text}</div>
                    </div>
                </div>
            </div>
        );
    }
);
MessageBox.displayName = "MessageBox";

export { MessageBox, messageBoxVariants };
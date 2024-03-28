import React, { forwardRef } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

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
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={""}
                            alt={""}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-zinc-300 border border-black/20">F U</AvatarFallback>
                    </Avatar>
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
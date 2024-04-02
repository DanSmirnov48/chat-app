import React, { forwardRef } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IMessage } from "@/types";
import { format } from "date-fns";

const messageBoxVariants = cva("py-2 px-3 rounded-lg", {
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
});

interface MessageBoxProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageBoxVariants> {
    message: IMessage
    isSelf: boolean;
}

const MessageBox = forwardRef<HTMLDivElement, MessageBoxProps>(
    ({ className, message, isSelf, ...props }, ref) => {
        const formattedTime = format(new Date(message.createdAt), "HH:mm");
        return (
            <div
                className={cn(
                    messageBoxVariants({ align: isSelf ? "self" : "other", ...props }),
                    className
                )}
                ref={ref}
                {...props}
            >
                <div
                    className={messageBoxVariants({ avatar: isSelf ? "self" : "other" })}
                >
                    <div
                        className={cn(
                            "relative text-sm py-2 px-4 shadow rounded-xl",
                            messageBoxVariants({ textStyle: isSelf ? "self" : "other" })
                        )}
                    >
                        <div className="mb-1 mr-10">{message.content}</div>
                        <div className="absolute bottom-1.5 right-1.5 text-[0.65rem] leading-3">
                            {formattedTime}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
MessageBox.displayName = "MessageBox";

export { MessageBox, messageBoxVariants };
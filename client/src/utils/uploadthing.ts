import { generateUploadButton } from "@uploadthing/react";

import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "../../../server/src/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export const UploadButton = generateUploadButton({
    url: "http://localhost:8080/api/uploadthing",
});
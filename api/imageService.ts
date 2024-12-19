import useSupabase from "~/api/supabaseInit";

const BUCKET_NAME = "wikiAuto_images";
const uploadFile = async (file: File, path: string) => {
  return useSupabase().storage.from(BUCKET_NAME).upload(path, file, {
    upsert: true,
  });
};

// const downloadFile = async (path: string) => {
//   return useSupabase().storage.from(BUCKET_NAME).download(path);
// };

export const imageService = {
  uploadFile,
};

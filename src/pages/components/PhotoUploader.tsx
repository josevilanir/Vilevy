import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { useRef } from "react";

export default function PhotoUploader({
  uploadingFiles,
  setUploadingFiles,
  startUpload,
  handleFileInput
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-6xl mx-auto mb-8 sm:mb-10">
      <div className="border-4 border-dashed border-purple-300 rounded-lg p-4 sm:p-8 bg-white shadow-lg text-center">
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInput}
        />
        <Button className="bg-purple-500 text-white mb-4" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="w-5 h-5 mr-2" /> Upload Photos
        </Button>
        {uploadingFiles.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadingFiles.map((file: any) => (
              <div key={file.preview} className="border p-4 rounded bg-purple-50">
                <img src={file.preview} alt="preview" className="w-full rounded-lg mb-4 max-h-[60vh] object-contain mx-auto" />
                <input
                  type="text"
                  placeholder="Photo Name"
                  value={file.customName}
                  onChange={(e) => setUploadingFiles((prev: any) => prev.map((f: any) =>
                    f.file === file.file ? { ...f, customName: e.target.value } : f
                  ))}
                  className="w-full mb-2 border rounded p-2"
                />
                <input
                  type="date"
                  value={file.customDate}
                  onChange={(e) => setUploadingFiles((prev: any) => prev.map((f: any) =>
                    f.file === file.file ? { ...f, customDate: e.target.value } : f
                  ))}
                  className="w-full mb-2 border rounded p-2"
                />
                <Textarea
                  placeholder="Description"
                  value={file.customDescription}
                  onChange={(e) => setUploadingFiles((prev: any) => prev.map((f: any) =>
                    f.file === file.file ? { ...f, customDescription: e.target.value } : f
                  ))}
                  className="w-full mb-2"
                />
                <Button className="w-full" disabled={file.isUploading} onClick={() => startUpload(file)}>
                  {file.isUploading ? `Uploading ${file.progress}%` : 'Start Upload'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

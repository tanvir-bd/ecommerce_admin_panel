"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuillEditor({ value, onChange }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!editorRef.current || !isClient) return;

    // Dynamically import Quill only on client-side
    import("quill").then((QuillModule) => {
      const Quill = QuillModule.default;

      if (quillRef.current) return; // Already initialized

      const quill = new Quill(editorRef.current!, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      // Set initial content
      quill.root.innerHTML = value;

      // Handle content changes
      quill.on("text-change", () => {
        const content = quill.root.innerHTML;
        onChange(content);
      });

      quillRef.current = quill;
    });

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [isClient]);

  // Update content if value changes externally
  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  if (!isClient) {
    return (
      <div className="min-h-[200px] border rounded-md p-4 bg-slate-50">
        <p className="text-slate-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[200px]">
      <style jsx global>{`
        .ql-container {
          font-size: 16px;
          height: 150px;
          overflow-y: auto;
        }
        .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        .ql-container {
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
      `}</style>
      <div ref={editorRef} />
    </div>
  );
}

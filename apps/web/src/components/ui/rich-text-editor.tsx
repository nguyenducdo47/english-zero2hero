"use client";

import "@/styles/rich-text-resize.css";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { NodeSelection } from "@tiptap/pm/state";
import Placeholder from "@tiptap/extension-placeholder";
import { useLocale, useTranslations } from "next-intl";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Palette,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { useAuthToken } from "@/hooks/use-auth-token";
import { uploadAdminEditorImage } from "@/lib/admin-editor-media";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import {
  fitImageDimensions,
  loadImageNaturalSize,
  normalizeRichTextHtml,
  parseImagePixelAttribute,
  RTE_IMAGE_DEFAULT_MAX_WIDTH,
  RTE_IMAGE_WIDTH_PRESETS,
} from "@/lib/rich-text";

const editorContentClass =
  "min-h-[var(--rte-min-h,5rem)] w-full px-3 py-2 text-sm outline-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md ";

const TEXT_COLOR_PRESETS = [
  "#000000",
  "#1f2937",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#ffffff",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#b45309",
  "#65a30d",
] as const;

function ToolbarButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-8 shrink-0"
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

const COLOR_PANEL_WIDTH_PX = 216;
const COLOR_PANEL_HEIGHT_PX = 200;

/** `<dialog>.showModal()` uses the top layer — portaling to `body` renders under the modal. */
function resolveFloatingPortalRoot(anchor: HTMLElement | null): HTMLElement {
  if (typeof document === "undefined") return document.body;
  const dialog = anchor?.closest("dialog");
  return dialog instanceof HTMLElement ? dialog : document.body;
}

function useClickOutsideMany(
  refs: RefObject<HTMLElement | null>[],
  onClose: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [enabled, onClose, refs]);
}

function TextColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const current = (editor.getAttributes("textStyle").color as string | undefined) ?? "#000000";

  useClickOutsideMany([triggerRef, panelRef], () => setOpen(false), open);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left;
    if (top + COLOR_PANEL_HEIGHT_PX > window.innerHeight - 8) {
      top = Math.max(8, rect.top - COLOR_PANEL_HEIGHT_PX - 4);
    }
    if (left + COLOR_PANEL_WIDTH_PX > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - COLOR_PANEL_WIDTH_PX - 8);
    }
    setCoords({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPortalRoot(null);
      return;
    }
    setPortalRoot(resolveFloatingPortalRoot(triggerRef.current));
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const apply = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setOpen(false);
  };

  const panel =
    open && portalRoot
      ? createPortal(
          <div
            ref={panelRef}
            className="pointer-events-auto fixed z-[9999] w-[13.5rem] rounded-lg border border-border bg-popover p-2.5 text-popover-foreground shadow-lg"
            style={{ top: coords.top, left: coords.left }}
            role="dialog"
            aria-label="Text color"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">Palette</p>
            <div className="grid grid-cols-8 gap-1">
              {TEXT_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  className={cn(
                    "size-6 rounded border border-border transition-transform hover:scale-110",
                    current === color && "ring-2 ring-ring ring-offset-1",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => apply(color)}
                />
              ))}
            </div>
            <div
              className="mt-3 flex items-center gap-2 border-t border-border pt-3"
              data-opens-file-picker
            >
              <input
                type="color"
                className="size-8 cursor-pointer rounded border border-input bg-transparent p-0"
                value={/^#[0-9a-f]{6}$/i.test(current) ? current : "#000000"}
                onChange={(e) => apply(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">Custom</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 w-full text-xs"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setOpen(false);
              }}
            >
              Remove color
            </Button>
          </div>,
          portalRoot,
        )
      : null;

  return (
    <div ref={triggerRef} className="inline-flex">
      <ToolbarButton
        title="Text color"
        active={open || Boolean(editor.getAttributes("textStyle").color)}
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) queueMicrotask(updatePosition);
            return next;
          });
        }}
      >
        <Palette className="size-4" />
      </ToolbarButton>
      {panel}
    </div>
  );
}

function findSelectedImage(editor: Editor): { pos: number; width: number | null; height: number | null } | null {
  const { selection, doc } = editor.state;

  if (selection instanceof NodeSelection && selection.node.type.name === "image") {
    return {
      pos: selection.from,
      width: parseImagePixelAttribute(selection.node.attrs.width),
      height: parseImagePixelAttribute(selection.node.attrs.height),
    };
  }

  const { from, to } = selection;
  let match: { pos: number; width: number | null; height: number | null } | null = null;
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === "image") {
      match = {
        pos,
        width: parseImagePixelAttribute(node.attrs.width),
        height: parseImagePixelAttribute(node.attrs.height),
      };
    }
  });
  return match;
}

function readImageSizeFromDom(editor: Editor, pos: number): { width: number | null; height: number | null } {
  const dom = editor.view.nodeDOM(pos);
  if (!(dom instanceof HTMLElement)) {
    return { width: null, height: null };
  }
  const img = dom instanceof HTMLImageElement ? dom : dom.querySelector("img");
  if (!(img instanceof HTMLImageElement)) {
    return { width: null, height: null };
  }
  const width = img.offsetWidth > 0 ? Math.round(img.offsetWidth) : null;
  const height = img.offsetHeight > 0 ? Math.round(img.offsetHeight) : null;
  return { width, height };
}

function applyImageSizeToNodeView(editor: Editor, pos: number, width: number, height: number) {
  const dom = editor.view.nodeDOM(pos);
  if (!(dom instanceof HTMLElement)) return;
  const img = dom instanceof HTMLImageElement ? dom : dom.querySelector("img");
  if (!(img instanceof HTMLImageElement)) return;
  img.style.width = `${width}px`;
  img.style.height = `${height}px`;
}

function selectLastImageNode(editor: Editor) {
  let imagePos: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "image") imagePos = pos;
  });
  if (imagePos !== null) {
    editor.chain().focus().setNodeSelection(imagePos).run();
  }
}

async function insertEditorImage(editor: Editor, src: string) {
  try {
    const natural = await loadImageNaturalSize(src);
    const { width, height } = fitImageDimensions(natural.width, natural.height);
    editor.chain().focus().setImage({ src, width, height }).run();
  } catch {
    editor
      .chain()
      .focus()
      .setImage({ src, width: RTE_IMAGE_DEFAULT_MAX_WIDTH, height: Math.round(RTE_IMAGE_DEFAULT_MAX_WIDTH * 0.75) })
      .run();
  }
  requestAnimationFrame(() => selectLastImageNode(editor));
}

function ImageSizeControls({ editor }: { editor: Editor }) {
  const imageWidth = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      const selected = findSelectedImage(ed);
      if (!selected) {
        return parseImagePixelAttribute(ed.getAttributes("image").width);
      }
      if (selected.width != null) return selected.width;
      return readImageSizeFromDom(ed, selected.pos).width;
    },
  });

  const setWidth = (targetWidth: number) => {
    const selected = findSelectedImage(editor);
    if (!selected) return;

    let currentW = selected.width;
    let currentH = selected.height;
    if (currentW == null || currentH == null) {
      const domSize = readImageSizeFromDom(editor, selected.pos);
      currentW ??= domSize.width;
      currentH ??= domSize.height;
    }
    currentW ??= targetWidth;
    currentH ??= targetWidth;

    const height =
      currentW > 0 ? Math.max(1, Math.round((currentH / currentW) * targetWidth)) : Math.round(targetWidth * 0.75);

    editor
      .chain()
      .focus()
      .setNodeSelection(selected.pos)
      .updateAttributes("image", { width: targetWidth, height })
      .run();

    applyImageSizeToNodeView(editor, selected.pos, targetWidth, height);
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-1 border-t border-border/80 px-1 py-1.5">
      <span className="px-1 text-xs text-muted-foreground">Image</span>
      {RTE_IMAGE_WIDTH_PRESETS.map((w) => (
        <Button
          key={w}
          type="button"
          size="sm"
          variant={imageWidth === w ? "secondary" : "outline"}
          className="h-7 min-w-11 px-2 text-xs"
          onClick={() => setWidth(w)}
        >
          {w}px
        </Button>
      ))}
      <span className="text-xs text-muted-foreground">
        {imageWidth ? `${imageWidth}px` : "—"} · chọn ảnh và kéo tay cầm (giữ Shift = giữ tỉ lệ)
      </span>
    </div>
  );
}

function ImageUploadControl({
  editor,
  onImageUpload,
}: {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const tToast = useTranslations("toast");

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onImageUpload) return;
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      await insertEditorImage(editor, url);
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void onFileChange(e)}
      />
      <span data-opens-file-picker className="inline-flex">
        <ToolbarButton
          title={onImageUpload ? "Upload image" : "Image upload unavailable"}
          disabled={!onImageUpload || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
        </ToolbarButton>
      </span>
    </>
  );
}

function RichTextToolbar({
  editor,
  onImageUpload,
}: {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
}) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const imageActive = useEditorState({
    editor,
    selector: ({ editor: ed }) => ed?.isActive("image") ?? false,
  });

  if (!editor) return null;

  return (
    <div className="relative z-20 overflow-visible border-b border-border bg-muted/30">
    <div className="flex flex-wrap items-center gap-0.5 p-1">
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      <ToolbarButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="size-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      <ToolbarButton
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="size-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ImageUploadControl editor={editor} onImageUpload={onImageUpload} />
      <TextColorPicker editor={editor} />
      <ToolbarButton
        title="Highlight"
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter className="size-4" />
      </ToolbarButton>
      <span className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      <ToolbarButton
        title="Undo"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Clear formatting"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        <Eraser className="size-4" />
      </ToolbarButton>
    </div>
    {imageActive ? <ImageSizeControls editor={editor} /> : null}
    </div>
  );
}

export type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  disabled?: boolean;
  /** Admin image upload; defaults to API upload when signed in. */
  onImageUpload?: (file: File) => Promise<string>;
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  minHeight = 80,
  className,
  disabled,
  onImageUpload,
}: RichTextEditorProps) {
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const resolvedImageUpload =
    onImageUpload ?? (token ? (file: File) => uploadAdminEditorImage(file, locale, token) : undefined);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "rte-image" },
        resize: {
          enabled: true,
          directions: [
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "top",
            "bottom",
            "left",
            "right",
          ],
          minWidth: 48,
          minHeight: 48,
          alwaysPreserveAspectRatio: false,
        },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      onChange(normalizeRichTextHtml(ed.getHTML()));
    },
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: editorContentClass,
        style: `--rte-min-h: ${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = normalizeRichTextHtml(editor.getHTML());
    const next = normalizeRichTextHtml(value || "");
    if (current !== next) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <RichTextToolbar editor={editor} onImageUpload={resolvedImageUpload} />
      <div className="overflow-visible rounded-b-lg px-1 pb-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

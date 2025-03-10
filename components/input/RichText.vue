<template>
  <div class="space-y-1">
    <label class="block">
      <span class="block text-sm md:text-base font-medium text-slate-700">
        {{ label }}
        <span v-if="isRequired" data-test="wildcard" class="text-red-600"
          >*</span
        >
      </span>
    </label>
    <div
      v-if="editor"
      :class="[
        {
          'ring-1 ring-sky-300 border-sky-300':
            !errorMessage && editor.isFocused,
          'border-gray-300': !errorMessage && !editor.isFocused,
          'border-pink-600': !!errorMessage,
          'ring-1 ring-pink-600 border-pink-600':
            editor.isFocused && errorMessage,
        },
        'border rounded-lg min-h-[240px]',
      ]"
    >
      <div class="control-group">
        <div
          :class="[
            'flex flex-wrap gap-0.5 button-group border-b p-0.5',
            editor.isFocused
              ? 'border-b-[1.5px] border-sky-500'
              : 'border-b-gray-300',
            {
              'border-b-2 border-b-sky-300': !errorMessage && editor.isFocused,
              'border-b-pink-600': !!errorMessage,
              'border-b-2 border-b-pink-600': editor.isFocused && errorMessage,
            },
          ]"
        >
          <button
            data-test="bold"
            :disabled="!editor.can().chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
            type="button"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <IconEditorBold class="fill-black h-5 w-5" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
            data-test="italic"
            type="button"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <IconEditorItalic class="fill-black h-5 w-5" />
          </button>
          <button
            v-show="false"
            :class="{ 'is-active': editor.isActive('underline') }"
            data-test="underline"
            type="button"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <IconEditorUnderline class="fill-black h-5 w-5" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
            data-test="strike"
            type="button"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <IconEditorStrike class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            data-test="heading1"
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          >
            <IconEditorHeading1 class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            data-test="heading2"
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            <IconEditorHeading2 class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            data-test="heading3"
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          >
            <IconEditorHeading3 class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
            data-test="heading4"
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
          >
            <IconEditorHeading4 class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
            data-test="heading5"
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
          >
            <IconEditorHeading5 class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
            data-test="heading6"
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
          >
            <IconEditorHeading6 class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{
              'is-active': editor.isActive('textStyle', { color: '#958DF1' }),
            }"
            class="relative"
            data-test="color"
            type="button"
            @click="openColorPalette"
          >
            <input
              ref="colorInputRef"
              type="color"
              class="color-input"
              @change="setColor"
            />
            <IconEditorColor
              class="h-5 w-5"
              :style="{ fill: currentColorStyle }"
            />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('highlight') }"
            data-test="highlight"
            type="button"
            @click="editor.chain().focus().toggleHighlight().run()"
          >
            <IconEditorHighlight class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
            data-test="left"
            type="button"
            @click="editor.chain().focus().setTextAlign('left').run()"
          >
            <IconEditorLeft class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
            data-test="center"
            type="button"
            @click="editor.chain().focus().setTextAlign('center').run()"
          >
            <IconEditorCenter class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
            data-test="right"
            type="button"
            @click="editor.chain().focus().setTextAlign('right').run()"
          >
            <IconEditorRight class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
            data-test="justify"
            type="button"
            @click="editor.chain().focus().setTextAlign('justify').run()"
          >
            <IconEditorJustify class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('bulletList') }"
            data-test="bulletList"
            type="button"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            <IconEditorBulletList class="fill-black h-5 w-5" />
          </button>
          <button
            :class="{ 'is-active': editor.isActive('orderedList') }"
            data-test="orderedList"
            type="button"
            @click="editor.chain().focus().toggleOrderedList().run()"
          >
            <IconEditorOrderedList class="fill-black h-5 w-5" />
          </button>
          <button
            data-test="horizontalRule"
            type="button"
            @click="editor.chain().focus().setHorizontalRule().run()"
          >
            <IconEditorHorizontalRule class="fill-black h-5 w-5" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().undo().run()"
            data-test="undo"
            type="button"
            @click="editor.chain().focus().undo().run()"
          >
            <IconEditorUndo class="fill-black h-5 w-5" />
          </button>
          <button
            :disabled="!editor.can().chain().focus().redo().run()"
            data-test="redo"
            type="button"
            @click="editor.chain().focus().redo().run()"
          >
            <IconEditorRedo class="fill-black h-5 w-5" />
          </button>
        </div>
      </div>
      <EditorContent :editor="editor" />
    </div>
    <p
      v-if="errorMessage"
      class="text-xs text-pink-600 pl-2 font-dm-sans"
      data-cy="error-message"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
<script setup lang="ts">
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { Editor, EditorContent } from "@tiptap/vue-3";

const props = defineProps<{
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  errorMessage?: string;
}>();

const model = defineModel<string>({ required: true });

const editor = ref<typeof Editor>();

onMounted(() => {
  editor.value = new Editor({
    content: model.value,
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] }),
      Typography,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      StarterKit,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-2 font-dm-sans focus:outline-none",
      },
    },
    onUpdate: () => {
      model.value = editor.value.getHTML();
    },
  });
});

watch(
  () => model.value,
  (newValue) => {
    const editorCurrentHTML = useString.toPre(editor.value.getHTML());
    const cursorPosition = editor.value.state.selection.$anchor.pos;

    const editorCurrentText = useString.toPre(editor.value.getText());
    const isEdition = !editorCurrentText && !!model.value;
    if (isEdition) {
      editor.value.commands.setContent(model.value, false);
      return;
    }

    const isSame =
      JSON.stringify(editorCurrentHTML) === JSON.stringify(newValue);

    if (isSame) {
      return;
    }

    editor.value.commands.setContent(editor.value.state.doc.content, false);
    editor.value.commands.setTextSelection(cursorPosition);
  },
);

const colorInputRef = ref<HTMLInputElement>();
const openColorPalette = (): void => {
  colorInputRef.value.click();
};

const currentColorStyle = shallowRef("");
const setColor = ($event: HTMLInputElement): void => {
  const color = $event.target.value;
  editor.value.chain().focus().setColor(color).run();
  currentColorStyle.value = color;
};

onBeforeUnmount(() => {
  editor.value.destroy();
});
</script>
<style lang="scss">
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: mediumpurple;
    border-radius: 0.4rem;
    color: black;
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: black;
    border-radius: 0.5rem;
    color: white;
    font-family: "JetBrainsMono", monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid gray;
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid gray;
    margin: 2rem 0;
  }

  /* Placeholder (at the top) */
  p.is-editor-empty:first-child::before {
    color: #788b9a;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
}

.control-group {
  @apply bg-gray-100 rounded-tl-lg rounded-tr-lg;
}

.button-group button {
  @apply border border-transparent rounded-md duration-100 ease-linear p-0.5;
}

.button-group button:hover {
  @apply border-gray-500;
}

.color-input {
  position: absolute;
  width: 0;
  height: 0;
  visibility: hidden;
  z-index: -1;
}

button.is-active {
  @apply border-primary/50;
}

button.is-active svg {
  @apply fill-primary;
}

div[contenteditable="true"] {
  height: calc(240px - 60px);
  border-radius: 0 0 8px 8px;
  background-color: #f1f4fa;
}
</style>

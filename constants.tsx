import React from 'react';

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_JSON_MODEL = "gemini-2.5-flash-preview-04-17"; // Can be the same if it handles JSON well, or a specific one if available

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M11.25 18V12.75a.75.75 0 01.75-.75h0a.75.75 0 01.75.75V18m-11.25 0h11.25m-11.25 0V9.75M12 9.75V3.75m0 6V9.75m6 9V9.75M12 9.75L18 3.75m-6 6L6 3.75" />
  </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A18.732 18.732 0 0112 22.5c-2.786 0-5.433-.608-7.499-1.632z" />
  </svg>
);

export const OfficeBuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6m-6 4.5h6M9 18.75h6" />
  </svg>
);

export const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375V16.5m0-12.75V3.75m0 12.75A5.625 5.625 0 0112 3.75a5.625 5.625 0 015.625 5.625c0 1.97-1.006 3.758-2.512 4.853A5.632 5.632 0 0012 18.375zm0-5.625a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

export const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.04c-5.5 0-10 4.49-10 10s4.5 10 10 10 10-4.49 10-10S17.5 2.04 12 2.04zm4.39 6.5h-1.61c-.58 0-.71.28-.71.7v1.01h2.28l-.3 2.28h-1.98v6.03h-2.48V12.53H10V10.25h1.59V8.99c0-1.58.97-2.45 2.39-2.45h1.9v2.01z" />
  </svg>
);

export const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2c-2.72 0-3.05.01-4.12.06-1.06.05-1.79.23-2.42.47-.65.25-1.23.58-1.77 1.14-.54.55-.88 1.12-1.13 1.77-.24.63-.42 1.36-.47 2.42C2.01 8.95 2 9.28 2 12s.01 3.05.06 4.12c.05 1.06.23 1.79.47 2.42.25.65.58 1.23 1.14 1.77.55.54 1.12.88 1.77 1.13.63.24 1.36.42 2.42.47 1.07.05 1.4.06 4.12.06s3.05-.01 4.12-.06c1.06-.05 1.79-.23 2.42-.47.65-.25 1.23-.58 1.77-1.13.54-.55.88-1.12 1.13-1.77.24-.63.42-1.36.47-2.42.05-1.07.06-1.4.06-4.12s-.01-3.05-.06-4.12c-.05-1.06-.23-1.79-.47-2.42-.25-.65-.58-1.23-1.13-1.77-.55-.54-1.12-.88-1.77-1.13-.63-.24-1.36-.42-2.42-.47C15.05 2.01 14.72 2 12 2zm0 1.8c2.67 0 2.98.01 4.03.06 1.02.04 1.58.22 1.96.37.49.19.82.42 1.15.75.33.33.56.66.75 1.15.15.38.33.94.37 1.96.05 1.05.06 1.36.06 4.03s-.01 2.98-.06 4.03c-.04 1.02-.22 1.58-.37 1.96-.19.49-.42.82-.75 1.15-.33.33-.66.56-1.15.75-.38.15-.94.33-1.96.37-1.05.05-1.36.06-4.03.06s-2.98-.01-4.03-.06c-1.02-.04-1.58-.22-1.96-.37-.49-.19-.82.42-1.15-.75-.33-.33-.56-.66-.75-1.15-.15-.38-.33.94-.37-1.96-.05-1.05-.06-1.36-.06-4.03s.01-2.98.06-4.03c.04-1.02.22-1.58.37-1.96.19-.49.42.82.75-1.15.33-.33.56-.66 1.15-.75.38-.15.94.33 1.96.37 1.05-.05 1.36-.06 4.03-.06zM12 7.25a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zm0 7.7a2.95 2.95 0 110-5.9 2.95 2.95 0 010 5.9zm5.63-7.31a1.12 1.12 0 100-2.24 1.12 1.12 0 000 2.24z"/>
  </svg>
);

export const TikTokIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.28-1.1-.63-1.6-.99V16.5c0 2.94-2.39 5.32-5.33 5.32s-5.32-2.38-5.32-5.32S6.4 11.18 9.34 11.18c.49 0 .98.07 1.45.19v-4.4c-.9-.31-1.85-.37-2.77-.21-2.13.36-3.88 2.06-4.29 4.24C3.51 12.15 3.5 13.08 3.5 14c0 3.86 3.13 6.99 6.99 6.99s6.99-3.13 6.99-6.99V7.49c.25-.13.49-.26.73-.41C17.47 5.58 16.5 3.46 14.99 1.94c-.65-.65-1.37-1.18-2.13-1.57-.2-.1-.4-.18-.58-.25C12.16.07 12.34.03 12.53.02z"/>
  </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 012.153 2.153L22.75 15l-1.534.436a4.5 4.5 0 01-2.153 2.153L18.25 19.5l-.813-2.846a4.5 4.5 0 01-2.153-2.153L13.75 12l1.534-.436a4.5 4.5 0 012.153-2.153L18.25 7.5z" />
  </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.291.225M9.256 5.79h5.488M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm4.62 12.87c-.19.37-.99 1.03-1.31 1.03-.28 0-.73 0-1.63-.3-1.4-.47-2.4-1.18-3.42-2.47-.84-1.05-1.38-2.01-1.38-2.59 0-.62.41-1.03.72-1.34.28-.28.58-.4.72-.4.19 0 .36 0 .5.46s.53 1.24.53 1.34-.11.35-.23.49c-.12.14-.24.23-.4.36s-.21.2-.05.37c.16.17.7.75 1.38 1.32.9.76 1.41.92 1.62.92.22 0 .52-.14.71-.43.19-.28.19-.53.14-.71s-.17-.33-.24-.43c-.07-.1-.12-.12-.05-.19s.38-.45.5-.6c.12-.15.2-.18.3-.12.1.06.46.22.53.46.08.24.08.93-.11 1.21z" />
  </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const MessengerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.43 0 4.713-.726 6.597-2.003L22 24l-1.496-3.403A11.917 11.917 0 0024 12c0-6.627-5.373-12-12-12zm0 21.6c-5.292 0-9.6-4.308-9.6-9.6S6.708 2.4 12 2.4s9.6 4.308 9.6 9.6-4.308 9.6-9.6 9.6z"/>
    <path d="M7.5 11.5l1.725-3.45L12 9.775l2.775-1.725L16.5 11.5l-2.775 1.725L12 15.025l-1.725-1.8z"/>
  </svg>
);

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.274 1.216.208l.883-.162a1.125 1.125 0 011.23.619l.547 1.002c.24.44.072.99-.338 1.28l-.754.502a1.125 1.125 0 00-.42 1.357l.297.943a1.125 1.125 0 001.356.42l.887-.202c.44-.1.99.073 1.282.338l.995.547c.39.212.527.703.338 1.109l-.163.883c-.066.372.002.76.208 1.072s.506.566.93.78l.893.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.893.149c-.424.07-.764.383-.93.78s-.274.844-.208 1.216l.162.883a1.125 1.125 0 01-.618 1.23l-1.002.547c-.44.24-.99.072-1.28-.338l-.502-.754a1.125 1.125 0 00-1.357-.42l-.943.297a1.125 1.125 0 00-.42 1.356l.203.887c.1.44-.073.99-.338 1.282l-.547.995a1.125 1.125 0 01-1.109.338l-.883-.163a1.125 1.125 0 00-1.072.208c-.316.224-.566.506-.78.93l-.149.893c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.893a1.125 1.125 0 00-.78-.93c-.372-.066-.76.002-1.072.208l-.883.162a1.125 1.125 0 01-1.23-.619l-.547-1.002c-.24-.44-.072-.99.338-1.28l.754-.502a1.125 1.125 0 00.42-1.357l-.297-.943a1.125 1.125 0 00-1.356-.42l-.887.203c-.44.1-.99-.073-1.282-.338l-.995-.547c-.39-.212-.527-.703-.338-1.109l.163-.883c.066-.372-.002-.76-.208-1.072a1.125 1.125 0 00-.93-.78l-.893-.149c-.542-.09-.94-.56-.94-1.11v-1.093c0 .55.398 1.02.94 1.11l.893.149a1.125 1.125 0 00.93-.78c.224-.316.274-.707.208-1.072l-.163-.883a1.125 1.125 0 01.618-1.23l1.002-.547c.44-.24.99-.072 1.28.338l.502.754a1.125 1.125 0 001.357.42l.943-.297a1.125 1.125 0 00.42-1.356L6.108 4.792c-.1-.44.073-.99.338-1.282l.547-.995A1.125 1.125 0 018.002 2.2l.883.163c.372.067.76-.002 1.072-.208.316-.224.566-.506.78-.93L10.343 3.94zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
  </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 3.94A1.874 1.874 0 0112 3.25a1.874 1.874 0 011.66.69l.004.006c.405.513.636 1.143.636 1.814v3.495c0 .483.17.948.473 1.31L16.5 12M10.34 3.94L6.75 12l3.59.005M10.34 3.94A8.25 8.25 0 004.5 12h15a8.25 8.25 0 00-5.84-8.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-3.258 4.807a.75.75 0 01-.91-.508l-.703-2.533a.75.75 0 01.91.508l.703 2.533zM8.57 15.573a.75.75 0 01-.492.707l-2.612.979a.75.75 0 01-.492-.707l2.612-.979zM15.43 15.573a.75.75 0 00.492.707l2.612.979a.75.75 0 00.492-.707l-2.612-.979z" />
  </svg>
);

export const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V4.5A2.25 2.25 0 019 2.25h1.5P12 4.5v8.25m.75-8.25A2.25 2.25 0 0115 4.5v8.25m0 0H9m6 0h3.375c.621 0 1.125.504 1.125 1.125V21a1.125 1.125 0 01-1.125 1.125H5.625A1.125 1.125 0 014.5 21V13.875c0-.621.504-1.125 1.125-1.125H9" />
  </svg>
);

export const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m0-8.25v.075M15.75 9.75v2.25M17.25 5.25H6.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5zm0 0V3.75m0 1.5H6.75m0 0H5.25m1.5 0V3.75m0 0H17.25m-12 15v-1.5m1.5 1.5H6.75m0 0v-1.5m10.5 1.5h1.5m-1.5-1.5v-1.5m0 0h1.5m-1.5 0V18m1.5-6.75h-1.5m1.5 0v-1.5M9 9.75h6M9 12.75h6M9 15.75h6" />
  </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const CalendarSparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25m10.5-2.25v2.25M6.75 21H3.75a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5h16.5a2.25 2.25 0 012.25 2.25v4.5M21.75 11.25v6.25a2.25 2.25 0 01-2.25 2.25H15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 4.5h.008v.008H15V4.5zm3 0h.008v.008H18V4.5zm-3 3h.008v.008H15V7.5zm3 0h.008v.008H18V7.5zm-3 3h.008v.008H15v-.008zm3 0h.008v.008H18v-.008z" />
    {/* Sparkles for AI part */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 15.75l-.813-2.846a.75.75 0 00-.547-.547L15.394 12l2.846-.813a.75.75 0 00.547-.547L19.5 7.894l.813 2.846a.75.75 0 00.547.547l2.846.813-2.846.813a.75.75 0 00-.547.547L19.5 15.75zM16.5 21.75l-.406-1.423a.375.375 0 00-.273-.273L14.398 19.5l1.423-.406a.375.375 0 00.273-.273L16.5 17.398l.406 1.423a.375.375 0 00.273.273l1.423.406-1.423.406a.375.375 0 00-.273.273L16.5 21.75z" />
  </svg>
);

export const FunnelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 6h-15M16.5 12H7.5m6 6H10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5L12 17.25 3.75 6.75z" />
 </svg>
);

export const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21.75c-2.636 0-5.055-.622-7.096-1.765z" />
  </svg>
);

export const PhoneArrowUpRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H5.25A2.25 2.25 0 003 3.75v16.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 20.25V13.5m-3-7.5V3.75M18 3.75h-3.75m3.75 0L14.25 7.5M12 18.75h.008v.008H12v-.008z" />
  </svg>
);

export const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm-3-3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm-3-3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008zm9-3h.008v.008H15v-.008zm0 3h.008v.008H15v-.008zm3-3h.008v.008H18v-.008zm0 3h.008v.008H18v-.008z" />
  </svg>
);

export const HandshakeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 8.25l-2.518 2.518L6.75 7.5m10.5 5.25l-2.518-2.518L10.5 13.5M5.25 15.75l1.096 1.096A1.5 1.5 0 007.5 17.25h.063c.27 0 .53-.105.724-.296L12 13.5l3.61 3.61a1.5 1.5 0 002.122 0l1.096-1.096M15 11.25a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.035 17.062A8.956 8.956 0 013 12.75c0-2.486.99-4.735 2.614-6.36M21.386 7.636A8.956 8.956 0 0012 3c-2.486 0-4.735.99-6.36 2.614m12.72 12.72A8.956 8.956 0 0112 21c-2.486 0-4.735.99-6.36-2.614" />
  </svg>
);

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3V21m-3-3a3 3 0 00-3-3h-3a3 3 0 00-3 3m6 0v-4.5m3.75-3.75a3.75 3.75 0 00-7.5 0M12 11.25V7.5m0 0a3.75 3.75 0 013.75-3.75M12 7.5A3.75 3.75 0 008.25 3.75M12 7.5v3.75m0 0H8.25m3.75 0h3.75M3.375 11.25A2.25 2.25 0 015.625 9h12.75a2.25 2.25 0 012.25 2.25" />
  </svg>
);

export const PresentationChartLineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M11.25 3.75h1.5M11.25 3.75a1.5 1.5 0 01-1.5-1.5M12.75 3.75a1.5 1.5 0 001.5-1.5M3.75 16.5v2.25A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V16.5M11.25 16.5h1.5M8.25 6.75h7.5M8.25 10.5h7.5M8.25 14.25h2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.875 12l1.875-1.875 1.875 1.875"/>
  </svg>
);

export const MagnifyingGlassCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
);
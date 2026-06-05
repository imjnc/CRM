const fs = require('fs');
let code = fs.readFileSync('D:/claude-full-stack/crm/components/leads/create-lead-modal.tsx', 'utf8');

const inputStyle = 'border-0 border-b border-gray-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black bg-transparent transition-colors';

// Define the variable near the top of the component
code = code.replace(
  'export function CreateLeadModal({ open, onClose }: CreateLeadModalProps) {',
  'const inputStyle = "' + inputStyle + '";\n\nexport function CreateLeadModal({ open, onClose }: CreateLeadModalProps) {'
);

// Add className to Input tags
code = code.replace(/<Input\n/g, '<Input\n                className={inputStyle}\n');
code = code.replace(/<Input\r\n/g, '<Input\n                className={inputStyle}\n');
code = code.replace(/<Input\s+type="email"/g, '<Input className={inputStyle} type="email"');
code = code.replace(/<Input\s+type="number"/g, '<Input className={inputStyle} type="number"');

// Fix the flex-1 input
code = code.replace('className="flex-1"', 'className={"flex-1 " + inputStyle}');

// Add className to SelectTrigger tags
code = code.replace(/<SelectTrigger>/g, '<SelectTrigger className={inputStyle}>');

// Fix the specific SelectTrigger
code = code.replace('className="w-[85px] px-2 text-xs"', 'className={"w-[75px] text-xs " + inputStyle}');

// Update Grid classes
code = code.replace(/className="grid grid-cols-3 gap-3"/g, 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"');
code = code.replace(/className="grid grid-cols-2 gap-3"/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"');

fs.writeFileSync('D:/claude-full-stack/crm/components/leads/create-lead-modal.tsx', code);

import { 
  FileText, Shield, Search, Calculator, Terminal, Image as ImageIcon, 
  File, Book, Webhook, Brain, Split, FileJson, Zap, Wrench, Database, Puzzle 
} from 'lucide-react';

export const getLucideIcon = (iconStr: string, className: string = "w-4 h-4") => {
  switch (iconStr) {
    case '📝': case 'FileText': return <FileText className={className} />;
    case '🛡️': case 'Shield': return <Shield className={className} />;
    case '🔍': case 'Search': return <Search className={className} />;
    case '🧮': case 'Calculator': return <Calculator className={className} />;
    case '💻': case 'Terminal': return <Terminal className={className} />;
    case '🎨': case 'ImageIcon': return <ImageIcon className={className} />;
    case '📄': case 'File': return <File className={className} />;
    case '📚': case 'BookOpen': return <Book className={className} />;
    case '🔌': case 'Webhook': return <Webhook className={className} />;
    case '🧠': case 'Brain': return <Brain className={className} />;
    case '🔀': case 'Split': case 'GitBranch': return <Split className={className} />;
    case '📤': case 'FileJson': return <FileJson className={className} />;
    case '⚡': case 'Zap': return <Zap className={className} />;
    case '🛠️': case 'Wrench': return <Wrench className={className} />;
    case '💾': case 'Database': return <Database className={className} />;
    case '🧩': case 'Puzzle': return <Puzzle className={className} />;
    default: return null;
  }
};

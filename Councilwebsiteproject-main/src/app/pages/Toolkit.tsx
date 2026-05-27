import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Download,
  FileText,
  FileSpreadsheet,
  BookOpen,
  CheckSquare,
  Lightbulb,
  ClipboardList,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ToolkitFile {
  name: string;
  description: string;
  file: string;          // path under /toolkit/
  type: 'docx' | 'xlsx' | 'xlsm' | 'doc' | 'pdf';
  tag?: string;          // e.g. "Template", "Sample", "Guide"
}

interface ToolkitSection {
  id: string;
  title: string;
  subtitle: string;
  phase?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  files: ToolkitFile[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

const sections: ToolkitSection[] = [
  {
    id: 'guide',
    title: 'Getting Started',
    subtitle: 'Reference guide and overview documents for local government project management',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: BookOpen,
    files: [
      {
        name: 'Guide to Project Management for Local Government',
        description: 'Comprehensive iPWEA reference guide covering the full project lifecycle (v2, Oct 2022)',
        file: 'guide/Guide-to-PM-for-Local-Government.pdf',
        type: 'pdf',
        tag: 'Guide',
      },
      {
        name: 'Project Summary Wall Chart',
        description: 'One-page visual overview of the complete project management framework',
        file: 'guide/Project-Summary-Wall-Chart.pdf',
        type: 'pdf',
        tag: 'Reference',
      },
    ],
  },
  {
    id: 'phase1',
    title: 'Phase 1 — Initiation',
    subtitle: 'Define the project, build the business case, and set up the project brief',
    phase: 'Initiation',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Lightbulb,
    files: [
      {
        name: 'Business Case Template',
        description: 'Structure and justify the project by documenting objectives, benefits, costs and risks',
        file: 'phase1/Business-Case-Template.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Project Brief Template',
        description: 'Capture the project scope, objectives, stakeholders and initial resource requirements',
        file: 'phase1/Project-Brief-Template.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Project Brief Sample',
        description: 'Completed example brief to guide your own document',
        file: 'phase1/Project-Brief-Sample.docx',
        type: 'docx',
        tag: 'Sample',
      },
      {
        name: 'Project Plan Template',
        description: 'High-level plan template for the initiation phase',
        file: 'phase1/Project-Plan-Template.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Basic Project Deliverables Template',
        description: 'Spreadsheet to list and track key project deliverables',
        file: 'phase1/Basic-Project-Deliverables-Template.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Work Breakdown Structure Template',
        description: 'Excel WBS template to break the project into manageable tasks',
        file: 'phase1/Work-Breakdown-Structure-Template.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Resource Cost Estimation Calculator',
        description: 'Calculate labour and material costs for project resources',
        file: 'phase1/Resource-Cost-Estimation-Calculator.xlsx',
        type: 'xlsx',
        tag: 'Calculator',
      },
      {
        name: 'Project Cost Estimation',
        description: 'Detailed spreadsheet for estimating total project costs',
        file: 'phase1/Project-Cost-Estimation.xlsx',
        type: 'xlsx',
        tag: 'Calculator',
      },
    ],
  },
  {
    id: 'phase2',
    title: 'Phase 2 — Planning',
    subtitle: 'Develop detailed plans for schedule, risks, communications and resources',
    phase: 'Planning',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: ClipboardList,
    files: [
      {
        name: 'Project Plan Template (Simple)',
        description: 'Lightweight project plan for smaller or straightforward projects',
        file: 'phase2/Project-Plan-Template-Simple.doc',
        type: 'doc',
        tag: 'Template',
      },
      {
        name: 'Project Management Plan (Detailed)',
        description: 'Comprehensive plan covering scope, schedule, budget, quality and stakeholders',
        file: 'phase2/Project-Management-Plan-Detailed.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Gantt Chart Template',
        description: 'Excel Gantt chart for scheduling and tracking project timelines',
        file: 'phase2/Gantt-Chart-Template.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Excel Project Planner',
        description: 'Comprehensive Excel planner with task management and milestone tracking',
        file: 'phase2/Excel-Project-Planner.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Communication Management Plan',
        description: 'Plan stakeholder communications, reporting frequency and channels',
        file: 'phase2/Communication-Management-Plan.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Risk Management Plan (Simple)',
        description: 'Basic framework for identifying and managing project risks',
        file: 'phase2/Risk-Management-Plan-Simple.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Risk Heatmap (Simple)',
        description: 'Visual Excel heatmap for plotting risk likelihood vs impact',
        file: 'phase2/Risk-Heatmap-Simple.xlsx',
        type: 'xlsx',
        tag: 'Tool',
      },
      {
        name: 'Risk Register & Matrix (Detailed)',
        description: 'Detailed risk register with a built-in risk matrix and scoring',
        file: 'phase2/Risk-Register-and-Matrix-Detailed.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Risk Register Template',
        description: 'Standard Excel risk register for logging and monitoring risks',
        file: 'phase2/Risk-Register-Template.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
    ],
  },
  {
    id: 'phase3',
    title: 'Phase 3 — Delivery',
    subtitle: 'Track progress, manage costs, report performance and control changes',
    phase: 'Delivery',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Truck,
    files: [
      {
        name: 'Weekly Status Report Template',
        description: 'Excel template for weekly project status updates to stakeholders',
        file: 'phase3/Weekly-Status-Report-Template.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Project Tracker with Gantt Chart',
        description: 'Combined task tracker and Gantt chart for monitoring delivery progress',
        file: 'phase3/Project-Tracker-with-Gantt.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
      {
        name: 'Project Performance Report Template',
        description: 'Formal report template for communicating project performance to senior stakeholders',
        file: 'phase3/Project-Performance-Report-Template.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Report on a Page Sample',
        description: 'Concise one-page report format — completed IT project sample',
        file: 'phase3/Report-on-a-Page-Sample.docx',
        type: 'docx',
        tag: 'Sample',
      },
      {
        name: 'Project Cost Monitoring',
        description: 'Excel macro-enabled workbook for tracking actual vs budgeted costs',
        file: 'phase3/Project-Cost-Monitoring.xlsm',
        type: 'xlsm',
        tag: 'Tool',
      },
      {
        name: 'Project Change Log Template',
        description: 'Log and manage scope changes, their impact and approval status',
        file: 'phase3/Project-Change-Log-Template.xlsx',
        type: 'xlsx',
        tag: 'Template',
      },
    ],
  },
  {
    id: 'phase4',
    title: 'Phase 4 — Close-out',
    subtitle: 'Formally close the project, capture lessons learned and review outcomes',
    phase: 'Close-out',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: XCircle,
    files: [
      {
        name: 'Project Closure Report Template',
        description: 'Document project outcomes, achievements, budget actuals and sign-off',
        file: 'phase4/Project-Closure-Report-Template.docx',
        type: 'docx',
        tag: 'Template',
      },
      {
        name: 'Post Implementation Review Template',
        description: 'Evaluate project success, capture lessons learned and measure benefit realisation',
        file: 'phase4/Post-Implementation-Review-Template.docx',
        type: 'docx',
        tag: 'Template',
      },
    ],
  },
  {
    id: 'checklists',
    title: 'Phase Checklists',
    subtitle: 'Quick-reference checklists to ensure nothing is missed at each phase gate',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    icon: CheckSquare,
    files: [
      {
        name: 'Project Initiation Checklist',
        description: 'Confirm all initiation activities are complete before moving to planning',
        file: 'checklists/Project-Initiation-Checklist.docx',
        type: 'docx',
        tag: 'Checklist',
      },
      {
        name: 'Project Planning Checklist',
        description: 'Verify all planning documents are in place before delivery begins',
        file: 'checklists/Project-Planning-Checklist.docx',
        type: 'docx',
        tag: 'Checklist',
      },
      {
        name: 'Project Delivery Checklist',
        description: 'Track key delivery milestones and quality gates during execution',
        file: 'checklists/Project-Delivery-Checklist.docx',
        type: 'docx',
        tag: 'Checklist',
      },
      {
        name: 'Project Close Checklist',
        description: 'Ensure all closure activities are completed before project sign-off',
        file: 'checklists/Project-Close-Checklist.docx',
        type: 'docx',
        tag: 'Checklist',
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fileIcon = (type: string) => {
  if (type === 'pdf') return FileText;
  if (['xlsx', 'xlsm', 'doc'].includes(type)) return FileSpreadsheet;
  return FileText;
};

const fileColor = (type: string) => {
  if (type === 'pdf') return 'text-red-600';
  if (['xlsx', 'xlsm'].includes(type)) return 'text-green-600';
  return 'text-blue-600';
};

const tagColor = (tag?: string) => {
  switch (tag) {
    case 'Template':  return 'bg-blue-100 text-blue-800';
    case 'Sample':    return 'bg-purple-100 text-purple-800';
    case 'Guide':     return 'bg-indigo-100 text-indigo-800';
    case 'Reference': return 'bg-gray-100 text-gray-800';
    case 'Checklist': return 'bg-teal-100 text-teal-800';
    case 'Calculator':return 'bg-green-100 text-green-800';
    case 'Tool':      return 'bg-orange-100 text-orange-800';
    default:          return 'bg-gray-100 text-gray-800';
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Toolkit() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    guide: true,
    phase1: true,
    phase2: false,
    phase3: false,
    phase4: false,
    checklists: true,
  });

  const toggle = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalFiles = sections.reduce((acc, s) => acc + s.files.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">iPWEA PM Toolkit</h2>
          <p className="text-gray-600 mt-2">
            Templates, checklists and tools from the iPWEA Project Management Toolkit for Local Government
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Saved centrally in the P3M Toolkit library so staff can download the current approved templates from one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {totalFiles} resources
          </Badge>
          <Badge variant="outline" className="text-sm">
            4 project phases
          </Badge>
        </div>
      </div>

      {/* Phase Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => {
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setExpanded(prev => ({ ...prev, [section.id]: true }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:opacity-80 ${section.bgColor} ${section.color} ${section.borderColor}`}
            >
              <Icon className="w-4 h-4" />
              {section.phase ?? section.title}
            </button>
          );
        })}
      </div>

      {/* Sections */}
      {sections.map(section => {
        const SectionIcon = section.icon;
        const isOpen = expanded[section.id] ?? true;

        return (
          <div key={section.id} id={section.id}>
            {/* Section Header */}
            <button
              onClick={() => toggle(section.id)}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 text-left transition-colors ${section.bgColor} ${section.borderColor}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/60`}>
                  <SectionIcon className={`w-5 h-5 ${section.color}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${section.color}`}>{section.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{section.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant="outline" className="hidden sm:flex">
                  {section.files.length} files
                </Badge>
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-gray-500" />
                  : <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </div>
            </button>

            {/* File Grid */}
            {isOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {section.files.map(file => {
                  const FileIcon = fileIcon(file.type);
                  const iconClass = fileColor(file.type);
                  return (
                    <Card key={file.file} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                            <FileIcon className={`w-5 h-5 ${iconClass}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-snug">{file.name}</h4>
                              {file.tag && (
                                <Badge className={`text-xs flex-shrink-0 ${tagColor(file.tag)}`}>
                                  {file.tag}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{file.description}</p>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/toolkit/${file.file}`}
                                download
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download .{file.type}
                              </a>
                              <span className="text-xs text-gray-400 uppercase font-mono">.{file.type}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer note */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">iPWEA Project Management Toolkit</p>
              <p className="text-xs text-gray-500 mt-1">
                Templates provided by the Institute of Public Works Engineering Australasia (iPWEA) for local government
                project management. The files are stored in the platform toolkit library and can be linked from project
                records as project templates are completed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

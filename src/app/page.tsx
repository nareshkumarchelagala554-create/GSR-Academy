"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookmark } from "react-icons/fa6";
import { BiSolidDownArrowAlt } from "react-icons/bi";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Bookmark,
  Info,
  Menu,
  X,
  ChevronDown,
  User,
  Settings
} from 'lucide-react';
import { SECTIONS, MOCK_QUESTIONS, INITIAL_TIME } from '@/src/lib/constants';
import { QuestionStatus, ExamState, Question, Section } from '@/src/lib/types';
import { useRouter } from 'next/navigation';

const STATUS_STYLES: Record<string, string> = {
  answered:
    'bg-[#2e7d32] text-white rounded-t-[12px] shadow-[inset_0_0px_10px_rgba(0,0,0,0.6)]',

  'not-answered':
    'bg-[#c62828] text-white rounded-[18px]  shadow-[inset_0_0px_10px_rgba(0,0,0,0.6)]',

  marked:
    'bg-[#ef6c00] text-white rounded-b-2xl shadow-[inset_0_0px_10px_rgba(0,0,0,0.7)]',

  'answered-marked':
    `bg-[#0097a7] text-white rounded-[18px]  relative
     after:content-[''] after:absolute after:bottom-0 after:right-0 
     after:w-2 after:h-2 after:bg-black after:rounded-sm shadow-[inset_0_0px_10px_rgba(0,0,0,0.6)]`,

  'not-visited':
    'bg-[#e0e0e0] text-gray-700 rounded-md border border-gray-300',
};

export default function ExamPage() {
  console.log("ExamPage rendered");
  const router = useRouter();
  const [state, setState] = useState<ExamState>(() => {
    const initialStatuses: Record<number, QuestionStatus> = {};
    MOCK_QUESTIONS.forEach(q => {
      initialStatuses[q.id] = 'not-visited';
    });
    initialStatuses[1] = 'not-answered';

    return {
      currentQuestionId: 46, // Start at Q46 as in the new image
      answers: {},
      statuses: initialStatuses,
      timeLeft: 12 * 60 + 34, // 00:12:34 as in the image
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSectionSummary, setShowSectionSummary] = useState<Section | null>(null);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [hoveredQ, setHoveredQ] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<'top' | 'bottom'>('bottom');
  const [tooltipCoords, setTooltipCoords] = useState({ x: 0, y: 0 });
  const paletteRef = React.useRef<HTMLDivElement | null>(null);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = useMemo(() =>
    MOCK_QUESTIONS.find(q => q.id === state.currentQuestionId) || MOCK_QUESTIONS[0],
    [state.currentQuestionId]
  );

  const currentSection = useMemo(() =>
    SECTIONS.find(s => currentQuestion.id >= s.startId && currentQuestion.id < s.startId + s.questionCount) || SECTIONS[0],
    [currentQuestion]
  );

  const handleOptionSelect = (optionId: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentQuestionId]: optionId },
      statuses: {
        ...prev.statuses,
        [prev.currentQuestionId]: prev.statuses[prev.currentQuestionId] === 'marked' ? 'answered-marked' : 'answered'
      }
    }));
  };

  const handleNavigate = (id: number) => {
    setState(prev => {
      const newStatuses = { ...prev.statuses };
      if (newStatuses[id] === 'not-visited') {
        newStatuses[id] = 'not-answered';
      }
      return {
        ...prev,
        currentQuestionId: id,
        statuses: newStatuses
      };
    });
    setShowSectionSummary(null);
  };

  const handleMarkForReview = () => {
    setState(prev => {
      const hasAnswer = !!prev.answers[prev.currentQuestionId];
      let newStatus: QuestionStatus = hasAnswer ? 'answered-marked' : 'marked';
      return {
        ...prev,
        statuses: { ...prev.statuses, [prev.currentQuestionId]: newStatus }
      };
    });
  };

  const handleClearResponse = () => {
    setState(prev => {
      const newAnswers = { ...prev.answers };
      delete newAnswers[prev.currentQuestionId];
      return {
        ...prev,
        answers: newAnswers,
        statuses: { ...prev.statuses, [prev.currentQuestionId]: 'not-answered' }
      };
    });
  };

  const handleSaveNext = () => {
    const nextId = state.currentQuestionId + 1;
    if (nextId <= MOCK_QUESTIONS.length) {
      handleNavigate(nextId);
    }
  };

  // const getStatusStyle = (status: QuestionStatus) => {
  //   switch (status) {
  //     case 'answered':
  //       return 'bg-[#2e7d32] text-white rounded-t-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]'; // GREEN (normal rounded)

  //     case 'not-answered':
  //       return 'bg-[#c62828] text-white rounded-r-3xl rounded-l-3xl'; // RED (circle)

  //     case 'marked':
  //       return 'bg-[#ef6c00] text-white rounded-t-xl rounded-b-md'; // ORANGE (top curved)

  //     case 'answered-marked':
  //       return `bg-[#1565c0] text-white rounded-md relative
  //             after:content-[''] after:absolute after:bottom-0 after:right-0 
  //             after:w-3 after:h-3 after:bg-black after:rounded-tl-md`; // BLUE + corner mark

  //     case 'not-visited':
  //       return 'bg-[#e0e0e0] text-gray-600 rounded-md border border-gray-300'; // GRAY

  //     default:
  //       return 'bg-gray-300 text-gray-600 rounded-md';
  //   }
  // };

  const getSectionStats = (sectionName: string) => {
    const sectionQuestions = MOCK_QUESTIONS.filter(q => q.section === sectionName);
    const counts = {
      'not-visited': 0,
      'not-answered': 0,
      'answered': 0,
      'marked': 0,
      'answered-marked': 0,
    };
    sectionQuestions.forEach(q => {
      counts[state.statuses[q.id]]++;
    });
    return counts;
  };

  const totalStats = useMemo(() => {
    const counts = {
      'not-visited': 0,
      'not-answered': 0,
      'answered': 0,
      'marked': 0,
      'answered-marked': 0,
    };
    Object.values(state.statuses).forEach(s => {
      counts[s as QuestionStatus]++;
    });
    return counts;
  }, [state.statuses]);

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden select-none text-[14px]">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] flex flex-wrap gap-20 p-10 rotate-[-25deg] overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i} className="text-4xl font-bold tracking-widest">1014003302</span>
        ))}
      </div>

      {/* Header */}

      <header className="bg-[#d0e3f7] border-b border-gray-300 px-2 py-2 
grid grid-cols-2 md:grid-cols-4 gap-2 items-center">

        {/* 1️⃣ LOGO */}
        <div className="flex items-center justify-center border-r border-dotted border-gray-500 h-[70px]">
          <Image
            src="/Av_gsrlogo.svg"
            alt="Logo"
            width={280}
            height={40}
            className="object-contain"
          />
        </div>

        {/* 2️⃣ TEST INFO */}
        <div className="flex flex-col items-center justify-center border-r border-dotted border-gray-500 h-[70px]">
          <p className="text-lg font-semibold text-gray-700">Test</p>
          <p className="text-sm font-semibold text-gray-600">AEEE 2026</p>
        </div>

        {/* 3️⃣ CURRENT SECTION */}
        <div className="flex flex-col items-center justify-center border-r border-dotted border-gray-500 h-[70px]">
          <p className="text-lg font-semibold text-gray-700">
            Current Section
          </p>
          <p className="text-sm font-semibold text-gray-600 capitalize">
            {currentSection.name}
          </p>
        </div>

        {/* 4️⃣ USER INFO */}
        <div className="flex items-center justify-center gap-3 h-[70px]">
          <Image
            src="/profile_avatar.png"
            alt="User"
            width={100}
            height={40}
            className="rounded-full"
          />

          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">
              Krishna Vinay Charan
            </p>
            <p className="text-xs text-gray-500">
              1014003302
            </p>
          </div>
        </div>

      </header>


      <div className="flex flex-col md:flex-row items-start md:items-end 
justify-between gap-3 md:gap-8 px-4 mb-4 py-2">

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold px-6 text-gray-700">
            Remaining Time:
          </span>

          <div className="bg-white px-3 py-[2px] rounded border border-gray-300 shadow-sm">
            <span className="font-mono font-bold text-gray-800 text-sm px-6">
              {formatTime(state.timeLeft)}
            </span>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100">
          <Settings size={14} />
          <span className="text-xs font-bold px-6">Resources</span>
          <ChevronDown size={14} />
        </div>

        {/* Font Controls */}
        <div className="flex items-center gap-3 ml-4 px-6">

          {/* Large A */}
          <span
            onClick={() => setFontSize('lg')}
            className={`cursor-pointer font-bold text-xl ${fontSize === 'lg' ? 'border border-blue-600 text-blue-600 p-1 bg-blue-50 italic' : 'text-blue-600 italic'
              }`}
          >
            A
          </span>

          {/* Medium A (selected box) */}
          <span
            onClick={() => setFontSize('md')}
            className={`cursor-pointer font-bold text-lg px-1 ${fontSize === 'md'
              ? 'border border-blue-600 text-blue-600 p-1 bg-blue-50 italic'
              : ' text-blue-600 italic'
              }`}
          >
            A
          </span>


          {/* Small A */}
          <span
            onClick={() => setFontSize('sm')}
            className={`cursor-pointer font-bold text-sm ${fontSize === 'sm' ? 'border border-blue-600 text-blue-600 p-1 bg-blue-50 italic' : 'text-blue-600 italic'
              }`}
          >
            A
          </span>

        </div>

      </div>

      {/* Section Tabs */}
      <nav className="bg-white border-b-3 border-[#2490fc] px-2 md:px-6 
flex items-center gap-2 md:gap-3 overflow-x-auto whitespace-nowrap">
        {SECTIONS.map((section) => (
          <div
            key={section.name}
            className="relative group"
            onMouseEnter={() => setShowSectionSummary(section)}
            onMouseLeave={() => setShowSectionSummary(null)}
          >
            <button
              onClick={() => handleNavigate(section.startId)}
              className={`px-8 py-2 text-sm font-bold transition-all border-3 border-b-transparent gap-6  rounded-t-lg -mb-px ${currentSection.name === section.name
                ? 'border-[#2490fc] bg-[#2490fc] text-white'
                : 'border-[#2490fc]  text-slate-600 hover:bg-slate-100'
                }`}
            >
              {section.name} ({section.questionCount})
            </button>

            {/* Section Summary Popup */}
            <AnimatePresence>
              {showSectionSummary?.name === section.name && (
                <motion.div
                  onMouseLeave={() => setShowSectionSummary(null)}
                  initial={{ opacity: 0, y: 10, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 10, x: '-50%' }}
                  className="absolute top-full left-[90%] mt-4 w-65 bg-white rounded-2xl shadow-2xl border-3 border-[#2490fc] z-50 p-5 flex flex-col items-center"
                >
                  <h3 className="text-sm font-bold text-slate-700 mb-4">{section.name}</h3>
                  <div className="w-full space-y-3">
                    <SummaryRow status="not-visited" label="Not Visited" count={getSectionStats(section.name)['not-visited']} />
                    <SummaryRow status="not-answered" label="Not Answered" count={getSectionStats(section.name)['not-answered']} />
                    <SummaryRow status="answered" label="Answered" count={getSectionStats(section.name)['answered']} />
                    <SummaryRow status="marked" label="Marked for review" count={getSectionStats(section.name)['marked']} />
                    <SummaryRow status="answered-marked" label="Answered & Marked" count={getSectionStats(section.name)['answered-marked']} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-r border-slate-300  overflow-y-auto flex flex-col z-20 w-[260px] md:w-[320px]"
            >
              <div className="p-4 border-b border-slate-200 bg-slate-50 ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Menu size={14} /> Question Palette
                  </h2>
                </div>

                <div
                  ref={paletteRef}
                  className="grid grid-cols-5 gap-1 max-h-[400px] overflow-y-auto p-1 custom-scrollbar relative"
                >
                  {MOCK_QUESTIONS.filter(q => q.section === currentSection.name).map((q) => (
                    <div
                      key={q.id}
                      className="relative"
                      onMouseEnter={(e) => {
                        setHoveredQ(q.id);

                        const rect = e.currentTarget.getBoundingClientRect();

                        setTooltipCoords({
                          x: rect.right + 10, // 👉 RIGHT SIDE
                          y: rect.top + rect.height / 2,
                        });
                      }}
                      onMouseLeave={() => setHoveredQ(null)}
                    >
                      {/* <button
                        key={q.id}
                        onClick={() => handleNavigate(q.id)}
                        className={`flex items-center justify-center font-bold transition-all duration-150 cursor-pointer

    ${state.currentQuestionId === q.id
                            ? 'w-12 h-10 scale-110 ring-2y  shadow-[inset_5px_5px_20px_rgba(0,0,0,0.9)]'
                            : 'w-12 h-10 '
                          }

     hover:inset-shadow-neutral-500

    ${STATUS_STYLES[state.statuses[q.id]]}
  `}
                      >
                        {q.number}
                      </button> */}
                      <button
                        key={q.id}
                        onClick={() => handleNavigate(q.id)}
                        className={`w-12 h-8 flex items-center justify-center font-bold
                            transition-all duration-150 cursor-pointer

                            ${STATUS_STYLES[state.statuses[q.id]]}

                            ${(state.statuses[q.id] === 'not-answered' ||
                            state.statuses[q.id] === 'answered-marked') &&
                            state.currentQuestionId === q.id
                            ? 'w-12 h-8 rounded-tr-4xl rounded-bl-4xl scale-110 ring-2 shadow-[inset_5px_5px_20px_rgba(0,0,0,0.9)] z-10'
                            : ''
                          }


                              ${state.currentQuestionId === q.id
                            ? 'scale-110 ring-2 shadow-[inset_5px_5px_20px_rgba(0,0,0,0.9)] z-10'
                            : ''
                          }

                                hover:scale-105 hover:shadow-md
                              `}
                      >
                        {q.number}
                      </button>


                    </div>
                  ))}
                </div>
              </div>
              {hoveredQ && (
                <div
                  className="fixed z-[9999] pointer-events-none"
                  style={{
                    left: tooltipCoords.x,
                    top: tooltipCoords.y,
                    transform: "translateY(-50%)",
                  }}
                >
                  <div className="w-13 h-13  text-center flex justify-center items-center bg-gray-800 text-white px-4 py-2 text-sm rounded shadow-lg whitespace-nowrap">
                    {hoveredQ}
                  </div>
                </div>
              )}

              <div className="p-4 flex-1 bg-white custom-scrollbar">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Legends & Filter</h3>
                <div className="space-y-3">
                  <LegendItem status="not-visited" label="Not Visited" count={totalStats['not-visited']} />
                  <LegendItem status="not-answered" label="Not Answered" count={totalStats['not-answered']} />
                  <LegendItem status="answered" label="Answered" count={totalStats['answered']} />
                  <LegendItem status="marked" label="Marked" count={totalStats['marked']} />
                  <LegendItem status="answered-marked" label="Answered & Marked" count={totalStats['answered-marked']} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-300"
          style={{
            left: isSidebarOpen ? 320 : 0,
          }}
        >
          {/* Triangle Shape */}
          <div
            className={`w-0 h-0 
      border-t-[25px] border-b-[25px]
      ${isSidebarOpen
                ? "border-r-[20px] border-r-[#2490fc]"
                : "border-l-[20px] border-l-[#2490fc]"
              }
      border-t-transparent border-b-transparent`}
          />

          {/* Arrow Icon */}
          {isSidebarOpen ? (
            <ChevronLeft
              size={14}
              className="absolute -left-4 top-1/2 -translate-y-1/2 text-white"
            />
          ) : (
            <ChevronRight
              size={14}
              className="absolute -right-4 top-1/2 -translate-y-1/2 text-white"
            />
          )}
        </button>

        {/* Question Area */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="text-lg font-bold text-slate-800">Q{currentQuestion.number}.</span>
              </div>

              <h2
                className={`font-medium leading-relaxed text-slate-800 mb-0
                ${fontSize === 'sm'
                    ? 'text-lg'
                    : fontSize === 'lg'
                      ? 'text-2xl'
                      : 'text-xl'
                  }`}
              >
                {currentQuestion.text}
              </h2>

              <div className="py-4">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    className={`w-full flex items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded cursor-pointer transition-all
      ${state.answers[state.currentQuestionId] === option.id
                        ? "border-gray-600 bg-gray-200"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {/* Radio Input */}
                    <input
                      type="radio"
                      name={`question-${state.currentQuestionId}`}
                      value={option.id}
                      checked={state.answers[state.currentQuestionId] === option.id}
                      onChange={() => handleOptionSelect(option.id)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />

                    {/* Option Label (A, B, C...) */}
                    <div
                      className={`flex items-center justify-center font-medium text-md
                                `}
                    >
                      ({option.id})
                    </div>

                    {/* Option Text */}
                    <span
                      className={`font-normal ${fontSize === 'sm'
                        ? 'text-base'
                        : fontSize === 'lg'
                          ? 'text-2xl'
                          : 'text-xl'
                        }`}
                    >
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-[#F8F9FA] border-t border-slate-300 p-3 md:p-4 
flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
            <button
              onClick={() => handleNavigate(state.currentQuestionId - 1)}
              disabled={state.currentQuestionId === 1}
              className="flex-1 py-2 rounded bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
            >
              Previous
            </button>
            {/* <Bookmark size={16} /> */}
            <button
              onClick={handleMarkForReview}
              className="flex-1 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <FaBookmark
                size={17} className="text-gray-600" />
              Mark
            </button>

            <button
              onClick={handleClearResponse}
              className="flex-1 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <X size={17} className="text-gray-600 font-bold" />
              Clear
            </button>

            {state.currentQuestionId === MOCK_QUESTIONS.length ? (
              <button
                onClick={() => setShowFinalSummary(true)}
                className="flex-1 py-2 rounded bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleSaveNext}
                className="flex-1 py-2 rounded bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
              >
                Next
              </button>
            )}
          </footer>
        </section>
        <button
          onClick={() => setShowFinalSummary(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group"
        >
          <motion.div
            whileHover={{ x: -3 }}
            className="bg-blue-5 *:0 text-white px-2 py-4 border border-b-2 border-gray-400 rounded-bl-full shadow-lg flex items-center justify-center"
          >
            <ChevronLeft size={24} className='text-blue-500 font-bold' />
          </motion.div>
          <div className="absolute right-10 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            View Summary
          </div>
        </button>
      </main>

      {/* Final Summary Modal */}
      <AnimatePresence>
        {showFinalSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFinalSummary(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="relative w-full md:max-w-[60%] h-[95vh] md:h-[88vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >

              {/* Header */}
              <div className="px-6 py-5 -mb-5  bg-white flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Summary Report
                </h2>
                {/* <button
                  onClick={() => setShowFinalSummary(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <X size={22} />
                </button> */}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 ">

                {SECTIONS.map((section) => {
                  const stats = getSectionStats(section.name);
                  const attempted =
                    stats.answered + stats["answered-marked"];

                  return (
                    <div
                      key={section.name}
                      className="flex items-center justify-between px-4 py-3 rounded-md bg-[#c6ddee]  border border-[#c5d9e8]  
                      shadow-[inset_7px_0_18px_rgba(0,0,0,0.2)]"
                    >
                      {/* Left */}
                      <div className="flex items-center gap-4 flex-wrap">

                        {/* Green Tag */}
                        <span className="px-6 py-1 bg-[#2e7d32]  text-white text-sm font-bold rounded-full capitalize shadow-[offset_3px_0_6px_rgba(0,0,0,0.7)]">
                          {section.name}
                        </span>

                        {/* Text */}

                        <p className="text-gray-700 text-sm font-bold flex items-center">
                          You have attempted{" "}
                          <span className="px-2 py-1 bg-[#2e7d32] text-white rounded font-bold mx-2">
                            {attempted}
                          </span>{" "}
                          of{" "}
                          <span className="px-2 py-1 bg-[#2e7d32] text-white rounded font-bold mx-2">
                            {section.questionCount}
                          </span>{" "}
                          questions
                        </p>
                      </div>

                      {/* Expand */}
                      <button className="flex items-center gap-1 text-gray-700 text-sm font-semibold hover:text-black">
                        Expand
                        <BiSolidDownArrowAlt size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={() => setShowFinalSummary(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition
                  shadow-[inset_0_0_19px_rgba(0,0,0,0.7)]"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendItem({ status, label, count }: { status: QuestionStatus, label: string, count: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-12 h-8 flex items-center justify-center text-xs font-bold
        ${STATUS_STYLES[status]}`}
      >
        {count}
      </div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
  );
}

function SummaryRow({ status, label, count }: { status: QuestionStatus, label: string, count: number }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-8 flex items-center justify-center text-sm font-bold shadow-md
        ${STATUS_STYLES[status]}`}
      >
        {count}
      </div>
      <span className="text-[13px] font-bold text-slate-600 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
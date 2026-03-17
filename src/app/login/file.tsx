"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Menu,
  User,
  X
} from "lucide-react";

import { SECTIONS, MOCK_QUESTIONS } from "@/src/lib/constants";
import { QuestionStatus, ExamState } from "@/src/lib/types";

export default function ExamPage() {

  const [state, setState] = useState<ExamState>(() => {

    const statuses: Record<number, QuestionStatus> = {};

    MOCK_QUESTIONS.forEach(q => {
      statuses[q.id] = "not-visited";
    });

    statuses[1] = "not-answered";

    return {
      currentQuestionId: 1,
      answers: {},
      statuses,
      timeLeft: 7200
    };

  });

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [fontSize, setFontSize] = useState("text-xl");
  const [showSummary, setShowSummary] = useState(false);

  /* ---------------- TIMER ---------------- */

  useEffect(() => {

    const timer = setInterval(() => {

      setState(prev => ({
        ...prev,
        timeLeft: Math.max(prev.timeLeft - 1, 0)
      }));

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const formatTime = (seconds: number) => {

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h.toString().padStart(2,"0")}:${m
      .toString()
      .padStart(2,"0")}:${s.toString().padStart(2,"0")}`;

  };

  /* ---------------- CURRENT QUESTION ---------------- */

  const currentQuestion = useMemo(
    () => MOCK_QUESTIONS.find(q => q.id === state.currentQuestionId),
    [state.currentQuestionId]
  );

  /* ---------------- NAVIGATION ---------------- */

  const navigate = (id: number) => {

    setState(prev => ({
      ...prev,
      currentQuestionId: id,
      statuses: {
        ...prev.statuses,
        [id]:
          prev.statuses[id] === "not-visited"
            ? "not-answered"
            : prev.statuses[id]
      }
    }));

  };

  const next = () => navigate(state.currentQuestionId + 1);
  const prev = () => navigate(state.currentQuestionId - 1);

  /* ---------------- ANSWER SELECT ---------------- */

  const handleOptionSelect = (id: string) => {

    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestionId]: id
      },
      statuses: {
        ...prev.statuses,
        [prev.currentQuestionId]: "answered"
      }
    }));

  };

  /* ---------------- STATUS COLORS ---------------- */

  const getStatusColor = (status: QuestionStatus) => {

    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "not-answered":
        return "bg-red-500 text-white";
      case "marked":
        return "bg-yellow-500 text-white";
      case "answered-marked":
        return "bg-cyan-500 text-white";
      default:
        return "bg-gray-200";
    }

  };

  /* ---------------- STATS ---------------- */

  const stats = useMemo(() => {

    const counts = {
      answered: 0,
      "not-answered": 0,
      "not-visited": 0,
      marked: 0,
      "answered-marked": 0
    };

    Object.values(state.statuses).forEach(s => {
      counts[s]++;
    });

    return counts;

  }, [state.statuses]);

  return (

    <div className="h-screen flex flex-col bg-gray-100">

      {/* HEADER */}

      <header className="flex items-center justify-between px-6 py-3 bg-white border-b">

        <div className="flex items-center gap-4">

          <div className="bg-red-900 text-white px-3 py-1 rounded font-bold">
            GSR
          </div>

          <div>
            <p className="text-xs text-gray-500">Test</p>
            <p className="font-bold">AEEE 2026</p>
          </div>

        </div>

        <div className="flex items-center gap-6">

          <div className="flex items-center gap-2 font-bold">
            <Clock size={16} />
            {formatTime(state.timeLeft)}
          </div>

          <div className="flex border rounded overflow-hidden">

            <button
              onClick={() => setFontSize("text-base")}
              className="px-2"
            >
              A
            </button>

            <button
              onClick={() => setFontSize("text-xl")}
              className="px-2"
            >
              A
            </button>

            <button
              onClick={() => setFontSize("text-2xl")}
              className="px-2"
            >
              A
            </button>

          </div>

          <User />

        </div>

      </header>

      {/* MAIN */}

      <main className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}

        {isLeftOpen && (

          <aside className="w-72 bg-white border-r flex flex-col">

            <div className="p-4 border-b flex items-center gap-2 font-bold">
              <Menu size={16} /> Question Palette
            </div>

            <div className="grid grid-cols-5 gap-2 p-4 overflow-y-auto">

              {MOCK_QUESTIONS.map(q => (

                <button
                  key={q.id}
                  onClick={() => navigate(q.id)}
                  className={`h-9 rounded text-sm border ${getStatusColor(
                    state.statuses[q.id]
                  )}`}
                >
                  {q.number}
                </button>

              ))}

            </div>

          </aside>

        )}

        {/* QUESTION AREA */}

        <section className="flex-1 flex flex-col bg-white">

          <div className="flex-1 p-10 overflow-y-auto">

            <div className="max-w-3xl mx-auto">

              <h2 className="text-lg font-bold mb-6">
                Q{currentQuestion?.number}
              </h2>

              <p className={`${fontSize} mb-10`}>
                {currentQuestion?.text}
              </p>

              <div className="space-y-4">

                {currentQuestion?.options.map(opt => (

                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`w-full border rounded p-4 text-left ${
                      state.answers[state.currentQuestionId] === opt.id
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {opt.text}
                  </button>

                ))}

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <footer className="flex justify-between p-4 border-t">

            <div className="flex gap-2">

              <button
                onClick={prev}
                disabled={state.currentQuestionId === 1}
                className="px-5 py-2 border rounded"
              >
                Previous
              </button>

              <button
                onClick={next}
                className="px-5 py-2 bg-blue-600 text-white rounded"
              >
                Save & Next
              </button>

            </div>

            <button
              onClick={() => setShowSummary(true)}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Submit
            </button>

          </footer>

        </section>

        {/* RIGHT SIDEBAR */}

        {isRightOpen && (

          <aside className="w-72 bg-gray-50 border-l flex flex-col">

            <div className="p-4 flex gap-3 items-center border-b bg-white">

              <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                <User />
              </div>

              <div>
                <p className="font-bold">Krishna Vinay Charan</p>
                <p className="text-xs text-gray-500">1014003302</p>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-2 p-3 text-xs">

              <Stat label="Answered" color="bg-green-500" value={stats.answered} />
              <Stat label="Not Answered" color="bg-red-500" value={stats["not-answered"]} />
              <Stat label="Not Visited" color="bg-gray-400" value={stats["not-visited"]} />
              <Stat label="Marked" color="bg-yellow-500" value={stats.marked} />

            </div>

          </aside>

        )}

      </main>

      {/* SUMMARY MODAL */}

      <AnimatePresence>

        {showSummary && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >

            <div className="bg-white p-8 rounded shadow-lg">

              <h2 className="text-xl font-bold mb-4">Exam Summary</h2>

              <p>Answered: {stats.answered}</p>
              <p>Not Answered: {stats["not-answered"]}</p>
              <p>Not Visited: {stats["not-visited"]}</p>

              <button
                onClick={() => setShowSummary(false)}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded"
              >
                Close
              </button>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}

/* STATUS BOX */

function Stat({
  label,
  color,
  value
}: {
  label: string;
  color: string;
  value: number;
}) {

  return (

    <div className="flex items-center gap-2 bg-white border p-2 rounded">

      <div
        className={`w-6 h-6 flex items-center justify-center text-white text-xs rounded ${color}`}
      >
        {value}
      </div>

      <span className="text-xs">{label}</span>

    </div>

  );

}
"use client"

import { Send } from "lucide-react"
import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export default function DocumentPage() {
    const [leftWidth, setLeftWidth] = useState(25)
    const [rightWidth, setRightWidth] = useState(20)
    const [showVideo, setShowVideo] = useState(false)

    const docId = useParams().id

    const isDragging = useRef(null)

    const startDrag = (panel) => {
        isDragging.current = panel
    }

    const stopDrag = () => {
        isDragging.current = null
    }

    const onDrag = (e) => {
        if (!isDragging.current) return

        const screenWidth = window.innerWidth
        const percent = (e.clientX / screenWidth) * 100

        if (isDragging.current === "left") {
            setLeftWidth(Math.min(Math.max(percent, 15), 40))
        }

        if (isDragging.current === "right") {
            const rightPercent = 100 - percent
            setRightWidth(Math.min(Math.max(rightPercent, 15), 35))
        }
    }

    useEffect(() => {
        window.addEventListener("mousemove", onDrag)
        window.addEventListener("mouseup", stopDrag)
        return () => {
            window.removeEventListener("mousemove", onDrag)
            window.removeEventListener("mouseup", stopDrag)
        }
    }, [])

    return (
        <main className="h-screen flex flex-col bg-black text-white">
            <Navbar docId={docId} />

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL */}
                <div style={{ width: `${leftWidth}%` }} className="bg-zinc-900/40 border-r border-zinc-800 flex flex-col">
                    <LeftPanel />
                </div>

                {/* DRAG HANDLE */}
                <div onMouseDown={() => startDrag("left")} className="w-px bg-zinc-900/40 cursor-col-resize hover:bg-zinc-600 transition" />

                {/* CHAT PANEL */}
                <div className="flex-1 bg-black flex flex-col">
                    <ChatPanel />
                </div>

                {/* DRAG HANDLE */}
                <div onMouseDown={() => startDrag("right")} className="w-px bg-zinc-900/40 cursor-col-resize hover:bg-zinc-600 transition" />

                {/* RIGHT PANEL */}
                <div style={{ width: `${rightWidth}%` }} className="bg-zinc-900/40 border-l border-zinc-800 p-6">
                    <VideoSection video_url={"https://www.w3schools.com/html/mov_bbb.mp4"} onOpen={() => setShowVideo(true)} />
                </div>
            </div>

            {showVideo && <VideoModal video_url={"https://www.w3schools.com/html/mov_bbb.mp4"} onClose={() => setShowVideo(false)} />}
        </main>
    )
}

function Navbar({ docId }) {
    return (
        <nav className="flex items-center justify-between px-8 py-6">
            <button className="bg-zinc-800 text-sm px-4 py-2 rounded-full hover:bg-zinc-700 transition">eSRL</button>

            <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-8 text-sm text-zinc-400">
                    <a href="/chat" className="hover:text-white transition">
                        Upload PDF
                    </a>
                </div>
                <span className=" transition text-sm text-green-600">eSRL Doc: {docId.slice(0,3) + "..." + docId.slice(-3,-1) + docId.charAt(docId.length-1)}</span>
            </div>
        </nav>
    )
}

function LeftPanel() {
    const [summaryOpen, setSummaryOpen] = useState(true)
    const [notesOpen, setNotesOpen] = useState(true)

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <Collapsible title="Summary" open={summaryOpen} setOpen={setSummaryOpen}>
                <p className="text-zinc-300 text-sm leading-relaxed">This document explains digital forensics, evidence preservation, and investigative workflows.</p>
            </Collapsible>

            <Collapsible title="Quick Notes" open={notesOpen} setOpen={setNotesOpen}>
                <ul className="text-zinc-300 text-sm space-y-2">
                    <li>• Chain of custody</li>
                    <li>• Evidence integrity</li>
                    <li>• Forensic imaging</li>
                </ul>
            </Collapsible>
        </div>
    )
}

function Collapsible({ title, open, setOpen, children }) {
    return (
        <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl">
            <div onClick={() => setOpen(!open)} className="flex justify-between items-center px-4 py-3 cursor-pointer">
                <h3 className="text-xs uppercase tracking-wider text-zinc-400">{title}</h3>
                <span className="text-zinc-500 text-sm">{open ? "−" : "+"}</span>
            </div>

            {open && <div className="px-4 pb-4">{children}</div>}
        </div>
    )
}

function ChatPanel() {
    const [messages, setMessages] = useState([{ role: "assistant", text: "Ask me anything about this document." }])

    const bottomRef = useRef()

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                    <ChatBubble key={i} side={msg.role === "user" ? "right" : "left"}>
                        {msg.text}
                    </ChatBubble>
                ))}

                <div ref={bottomRef} />
            </div>

            <ChatInput
                onSend={(text) => {
                    setMessages([...messages, { role: "user", text }])
                }}
            />
        </>
    )
}

function ChatBubble({ children, side }) {
    const isRight = side === "right"

    return (
        <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
            <div
                className={`px-4 py-3 rounded-xl text-sm max-w-md
        ${isRight ? "bg-neutral-800/70 text-white" : "bg-zinc-800 text-zinc-200"}`}
            >
                {children}
            </div>
        </div>
    )
}

function ChatInput({ onSend }) {
    const [input, setInput] = useState("")

    const send = () => {
        if (!input.trim()) return
        onSend(input)
        setInput("")
    }

    return (
        <div className="p-4 bg-black">
            <div className="flex gap-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask something..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
                />

                <button onClick={send} className="bg-zinc-800 text-zinc-200 px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition">
                    <Send />
                </button>
            </div>
        </div>
    )
}

function VideoSection({ video_url, onOpen }) {
    return (
        <div className="h-full flex flex-col justify-between">
            {/* Header */}
            <div>
                <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-4">Generated Video</h3>

                {/* Video Preview Card */}
                <div onClick={onOpen} className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 transition cursor-pointer group">
                    <video src={video_url} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition" />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <div className="w-0 h-0 border-l-[10px] border-l-black border-y-[6px] border-y-transparent ml-1"></div>
                        </div>
                    </div>
                </div>

                {/* Caption */}
                <p className="text-zinc-500 text-xs mt-3">Click to expand and view the full generated explanation video.</p>
            </div>

            {/* Fullscreen Button */}
            <button onClick={onOpen} className="mt-6 text-sm bg-zinc-800 text-white py-2 border border-zinc-700 focus:border-zinc-200 rounded-lg hover:opacity-90 transition">
                Play Video
            </button>
        </div>
    )
}

function VideoModal({ video_url, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative w-4/5 max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-white z-10">
                    ✕
                </button>

                <video src={video_url} controls autoPlay className="w-full" />
            </div>
        </div>
    )
}

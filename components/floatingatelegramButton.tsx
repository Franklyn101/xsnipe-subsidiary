"use client";

import { useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";

export default function FloatingTelegramButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const telegramUrl = `https://t.me/xsnipeai?text=${encodeURIComponent(
      trimmedMessage
    )}`;

    window.open(telegramUrl, "_blank", "noopener,noreferrer");

    setMessage("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Box */}
      {isOpen && (
        <div
          className="
            absolute
            bottom-20
            right-0
            w-[290px]
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
            ring-1
            ring-black/10
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#229ED9] px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Contact Support</p>
              <p className="text-xs text-white/80">
                We&apos;re here to help
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-xl
                text-white/80
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              ×
            </button>
          </div>

          {/* Chat Content */}
          <div className="p-4">
            <p className="mb-3 text-sm text-gray-600">
              How can we help you?
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={4}
              autoFocus
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-gray-200
                p-3
                text-sm
                text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-[#229ED9]
                focus:ring-2
                focus:ring-[#229ED9]/20
              "
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#229ED9]
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#168dcc]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FaTelegramPlane size={16} />
              Send 
            </button>

            <p className="mt-2 text-center text-[11px] text-gray-400">
              Press Enter to send
            </p>
          </div>
        </div>
      )}

      {/* Floating Telegram Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Contact Support on Telegram"
        className="group relative"
      >
        {/* Pulse */}
        <span
          className="
            absolute
            inset-0
            animate-ping
            rounded-full
            bg-[#229ED9]/40
          "
        />

        {/* Curved CONTACT SUPPORT text */}
        <div
          className="
            pointer-events-none
            absolute
            -left-8
            -top-9
            h-[125px]
            w-[125px]
          "
        >
          <svg
            viewBox="0 0 140 140"
            className="h-full w-full overflow-visible"
          >
            <defs>
              <path
                id="supportArc"
                d="M 18,70 A 52,52 0 0,1 122,70"
                fill="none"
              />
            </defs>

            <text
              className="fill-[#229ED9] text-[13px] font-bold uppercase"
              letterSpacing="1.2"
            >
              <textPath
                href="#supportArc"
                startOffset="40%"
                textAnchor="middle"
              >
                CONTACT SUPPORT
              </textPath>
            </text>
          </svg>
        </div>

        {/* Telegram Icon */}
        <span
          className="
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#229ED9]
            text-white
            shadow-lg
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:shadow-xl
          "
        >
          <FaTelegramPlane size={28} />
        </span>
      </button>
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from "react"

// Check if speech recognition is supported
const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

export default function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(isSpeechRecognitionSupported())
    const [transcript, setTranscript] = useState("")
    const recognitionRef = useRef(null)
    const onResultCallbackRef = useRef(null)
    const silenceTimerRef = useRef(null)

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        if (!isSupported) return null

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true // Keep listening for a short period
        recognition.interimResults = true
        recognition.lang = "ar-EG"
        recognition.maxAlternatives = 1

        recognition.onresult = (event) => {
            let finalTranscript = ""

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + (prev ? " " : "") + finalTranscript)

                // Call the callback if provided
                if (onResultCallbackRef.current) {
                    onResultCallbackRef.current(finalTranscript)
                }

                // Reset silence timer when we get final results
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                }

                // Set a timer to stop recognition after 2 seconds of silence
                silenceTimerRef.current = setTimeout(() => {
                    if (recognitionRef.current) {
                        recognitionRef.current.stop()
                    }
                }, 2000)
            }
        }

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error)
            // Clear timer on error
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            setIsListening(false)
        }

        recognition.onend = () => {
            // Clear timer when recognition ends
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            setIsListening(false)
        }

        recognition.onspeechend = () => {
            // Set a timer to stop recognition after 2 seconds of silence
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            silenceTimerRef.current = setTimeout(() => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop()
                }
            }, 2000)
        }

        return recognition
    }, [isSupported])

    // Initialize recognition on mount
    useEffect(() => {
        if (isSupported) {
            recognitionRef.current = initRecognition()
        }

        return () => {
            // Cleanup timers and recognition
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [isSupported, initRecognition])

    const startListening = useCallback(() => {
        if (isSupported && recognitionRef.current) {
            try {
                // Clear any existing timers
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                }

                // Reset transcript
                setTranscript("")
                recognitionRef.current.start()
                setIsListening(true)
            } catch (error) {
                console.error("Error starting speech recognition:", error)
                setIsListening(false)
            }
        }
    }, [isSupported])

    const stopListening = useCallback(() => {
        if (isSupported && recognitionRef.current) {
            try {
                // Clear timers
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                }
                recognitionRef.current.stop()
                setIsListening(false)
            } catch (error) {
                console.error("Error stopping speech recognition:", error)
            }
        }
    }, [isSupported])

    const resetTranscript = useCallback(() => {
        setTranscript("")
    }, [])

    const setOnResultCallback = useCallback((callback) => {
        onResultCallbackRef.current = callback
    }, [])

    return {
        isListening,
        isSupported,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        setOnResultCallback
    }
}
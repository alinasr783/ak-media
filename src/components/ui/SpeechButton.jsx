import { Mic, MicOff } from "lucide-react"
import { useEffect, useState } from "react"
import useSpeechRecognition from "../../hooks/useSpeechRecognition"
import { Button } from "./button"

export default function SpeechButton({ onTranscriptChange, isDisabled = false }) {
    const {
        isListening,
        isSupported,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        setOnResultCallback
    } = useSpeechRecognition()
    
    const [localTranscript, setLocalTranscript] = useState("")

    // Set up the callback for speech results
    useEffect(() => {
        setOnResultCallback((newTranscript) => {
            if (onTranscriptChange) {
                onTranscriptChange(newTranscript)
            }
        })
    }, [onTranscriptChange, setOnResultCallback])

    // Handle local transcript changes
    useEffect(() => {
        setLocalTranscript(transcript)
    }, [transcript])

    // Reset when disabled
    useEffect(() => {
        if (isDisabled) {
            stopListening()
            resetTranscript()
            setLocalTranscript("")
        }
    }, [isDisabled, resetTranscript, stopListening])

    const handleToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            // Reset transcript before starting new session
            resetTranscript()
            setLocalTranscript("")
            startListening()
        }
    }

    if (!isSupported) {
        return null
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleToggle}
            disabled={isDisabled}
            className={isListening ? "animate-pulse bg-red-500 hover:bg-red-600 text-white" : ""}
        >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
    )
}
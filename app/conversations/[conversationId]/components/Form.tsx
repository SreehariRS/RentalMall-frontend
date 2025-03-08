"use client"

import useConversation from "@/app/hooks/useConversation"
import axios from "axios"
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form"
import { HiPaperAirplane, HiPhoto, HiMicrophone } from "react-icons/hi2"
import MessageInput from "./MessageInput"
import { CldUploadButton } from "next-cloudinary"
import { useState } from "react"

function Form() {
  const { conversationId } = useConversation()
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: { message: "" },
  })

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true })
    axios.post("/api/messages", {
      ...data,
      conversationId,
    })
  }

  const handleUpload = (result: any) => {
    axios.post('/api/messages', {
      image: result?.info?.secure_url,
      conversationId,
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      setIsRecording(true)

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const formData = new FormData()
        formData.append("file", blob, "voice-note.webm")
        formData.append("upload_preset", "Rental") // Same preset as images

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          formData
        )
        
        axios.post('/api/messages', {
          voice: response.data.secure_url,
          conversationId,
        })
        stream.getTracks().forEach(track => track.stop())
      }
      recorder.start()
    } catch (error) {
      console.error("Error recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  return (
    <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
      <CldUploadButton
        options={{ maxFileSize: 10485760 }}
        onSuccess={handleUpload}
        uploadPreset="Rental"
      >
        <HiPhoto size={30} className="text-slate-700" />
      </CldUploadButton>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-2 rounded-full ${
          isRecording ? 'bg-red-500' : 'bg-slate-700'
        } cursor-pointer hover:${isRecording ? 'bg-red-600' : 'bg-slate-800'} transition`}
      >
        <HiMicrophone size={20} className="text-white" />
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 lg:gap-4 w-full">
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
        />
        <button type="submit" className="rounded-full p-2 bg-slate-700 cursor-pointer hover:bg-slate-800 transition">
          <HiPaperAirplane className="text-white" />
        </button>
      </form>
    </div>
  )
}

export default Form
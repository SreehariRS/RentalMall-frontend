"use client"
import qs from "query-string"
import { useRouter, useSearchParams } from 'next/navigation'
import Modal from './Modal'
import useSearchModal from '@/app/hooks/useSearchModal'
import { useCallback, useMemo, useState } from 'react'
import { Range } from 'react-date-range'
import dynamic from 'next/dynamic'
import CountrySelect, { CountrySelectValue } from '../inputs/LocationSelect'
import { formatISO } from "date-fns"
import Heading from "../Heading"
import Calendar from "../inputs/Calendar"
import Counter from "../inputs/Counter"


enum STEPS {
    LOCATION=0,
    DATE=1,
    INFO=2
}

function SearchModal() {
    const SearchModal = useSearchModal()
    const params = useSearchParams()
    const router = useRouter()

    const [location , setLocation]=useState<CountrySelectValue>()
    const [step , setStep]= useState(STEPS.LOCATION)
    const [guestCount , setguestCount]= useState(1)
    const [roomCount , setRoomCount]= useState(1)
    const [dateRange , setDateRange]=useState<Range >({
        startDate:new Date(),
        endDate:new Date(),
        key:"selection"
    })

    const Map = useMemo(()=>dynamic(()=>import('../Map'),{
        ssr:false
    }),[location])

    const onBack = useCallback(()=>{
        setStep((value)=>value-1)
    },[])

    const onNext = useCallback(()=>{
        setStep((value)=>value+1)
    },[])

    const onSubmit=useCallback(async()=>{
        if(step !==STEPS.INFO){
            return onNext()
        }
        let currentQuery ={}
        if(params){
            currentQuery=qs.parse(params.toString())
        }
        const updatedQuery :any={
            ...currentQuery,
            locationValue:location?.value,
            guestCount,
            roomCount
        }
        if(dateRange.startDate){
            updatedQuery.startDate =formatISO(dateRange.startDate)
        }
        if(dateRange.endDate){
            updatedQuery.endDate =formatISO(dateRange.endDate)
        }
        const url = qs.stringifyUrl({
            url:'/',
            query:updatedQuery
        },{skipNull:true})

        setStep(STEPS.LOCATION)
        SearchModal.onClose()

        router.push(url)

    },[step,SearchModal,location,router,guestCount,roomCount,dateRange,onNext,params])

    const actionLabel = useMemo(()=>{
        if(step ===STEPS.INFO){
            return "Search"
        }
        return "Next"
    },[step])
    const secondaryActionLabel = useMemo(()=>{
        if(step ===STEPS.LOCATION){
            return undefined
        }
        return "Back"
    },[step])
     let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
            title="Find Your Perfect Rental with RentalMall"
            subtitle="Select the Best Rentals for Your Needs, Anywhere!"
            />
            <CountrySelect
            value={location}
            onChange={(value)=>
                setLocation(value as CountrySelectValue)
            }
            />
            <hr />
            <Map center={location?.latlng}/>
        </div>
     )

     if(step ===STEPS.DATE){
        bodyContent=(
            <div className="flex flex-col gap-8">
                <Heading
                title="Pick Your Perfect Rental Dates"
                subtitle="Set Your Dates & Enjoy a Hassle-Free Rental Experience!"
                />
                <Calendar
                value={dateRange}
                onChange={(value)=>setDateRange(value.selection)}
                />
            </div>
        )
     }


     if(step===STEPS.INFO){
        bodyContent=(

            <div className="flex flex-col gap-8">
            <Heading
            title="More information"
            subtitle="Find the Best Rental for Your Needs!"
            />
            <Counter
            title="Guests"
            subtitle="how many gusts"
            value={guestCount}
            onChange={(value)=>setguestCount(value)}
            
            />
               <Counter
            title="Rooms "
            subtitle="how many Rooms do you need?"
            value={roomCount}
            onChange={(value)=>setRoomCount(value)}
            
            />
            </div>
           
        )
     }

  return (
    <Modal
    isOpen={SearchModal.isOpen}
    onClose={SearchModal.onClose}
    onSubmit={onSubmit}
    title='Filters'
    actionLabel={actionLabel}
    secondaryActionLabel={secondaryActionLabel}
    secondaryAction={step === STEPS.LOCATION ?undefined:onBack}
    body={bodyContent}
    />
  )
}

export default SearchModal
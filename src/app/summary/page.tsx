"use client"

import React, { useState } from 'react'
import LocationWiseAudits from '@/components/charts/LocationWise'
import { useLocationWiseAuditsQuery, useSBUWiseAuditsQuery } from '@/api'
import SBUWiseAudits from '@/components/charts/SBUWise'
import Image from 'next/image'

const SummaryPage = () => {
    const [yearRange, setYearRange] = useState({
        startYear: new Date().getFullYear() - 1,
        endYear: new Date().getFullYear()
    })

    const { data, isLoading, isError } = useLocationWiseAuditsQuery({
        startYear: yearRange.startYear,
        endYear: yearRange.endYear
    })

    const { data: sbuData, isLoading: sbuLoading, isError: sbuError } = useSBUWiseAuditsQuery({
        startYear: yearRange.startYear,
        endYear: yearRange.endYear
    })

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-start items-center gap-2 mb-6">
                <Image src={"/images/small-logo.png"} width={30} height={30} alt='icon' />
                <h1 className="text-2xl font-bold text-primary">LASER Summary AI</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 place-items-end">
                <div className="w-full">
                    {isError ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            Failed to load location data. Please try again later.
                        </div>
                    ) : (
                        <LocationWiseAudits
                            data={data?.data || []}
                            loading={isLoading}
                            yearRange={yearRange}
                        />
                    )}
                </div>

                <div className="w-full">
                    {sbuError ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            Failed to load SBU data. Please try again later.
                        </div>
                    ) : (
                        <SBUWiseAudits
                            data={sbuData?.data || []}
                            loading={sbuLoading}
                            yearRange={yearRange}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default SummaryPage

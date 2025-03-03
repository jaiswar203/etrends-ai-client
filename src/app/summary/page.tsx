"use client"

import React, { useState } from 'react'
import LocationWiseAudits from '@/components/charts/LocationWise'
import { useLocationWiseAuditsQuery, useSBUWiseAuditsQuery } from '@/api'
import SBUWiseAudits from '@/components/charts/SBUWise'

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
            <div className="flex justify-between items- mb-6">
                <h1 className="text-2xl font-bold">Audit Summary Dashboard</h1>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="startYear" className="text-sm font-medium">From:</label>
                        <select 
                            id="startYear"
                            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
                            value={yearRange.startYear}
                            onChange={(e) => setYearRange({...yearRange, startYear: Number(e.target.value)})}
                        >
                            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 4 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <label htmlFor="endYear" className="text-sm font-medium">To:</label>
                        <select 
                            id="endYear"
                            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
                            value={yearRange.endYear}
                            onChange={(e) => setYearRange({...yearRange, endYear: Number(e.target.value)})}
                        >
                            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 4 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
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

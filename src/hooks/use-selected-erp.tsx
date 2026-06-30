'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, createContext, useContext, useCallback, useMemo } from 'react'

export interface ErpSystem {
  id: string
  name: string
  industry: string
  description?: string
  status: string
  color?: string
  sortOrder?: number
}

interface SelectedErpContextType {
  selectedErpId: string | null
  setSelectedErpId: (id: string) => void
  systems: ErpSystem[]
  selectedSystem: ErpSystem | undefined
  isLoading: boolean
}

const SelectedErpContext = createContext<SelectedErpContextType>({
  selectedErpId: null,
  setSelectedErpId: () => {},
  systems: [],
  selectedSystem: undefined,
  isLoading: true,
})

export function SelectedErpProvider({ children }: { children: React.ReactNode }) {
  const [selectedErpId, setSelectedErpIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedErpId')
    }
    return null
  })

  const { data: systems = [], isLoading } = useQuery<ErpSystem[]>({
    queryKey: ['erp-systems'],
    queryFn: () => fetch('/api/erp/systems').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const effectiveErpId = useMemo(() => {
    if (selectedErpId && systems.find(s => s.id === selectedErpId)) {
      return selectedErpId
    }
    if (systems.length > 0) {
      return systems[0].id
    }
    return null
  }, [selectedErpId, systems])

  const setSelectedErpId = useCallback((id: string) => {
    setSelectedErpIdState(id)
    localStorage.setItem('selectedErpId', id)
  }, [])

  const selectedSystem = systems.find(s => s.id === effectiveErpId)

  return (
    <SelectedErpContext.Provider value={{ selectedErpId: effectiveErpId, setSelectedErpId, systems, selectedSystem, isLoading }}>
      {children}
    </SelectedErpContext.Provider>
  )
}

export function useSelectedErp() {
  return useContext(SelectedErpContext)
}
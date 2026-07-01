import { useMemo, useState } from 'react'

export default function useTicketFilters() {
  const [categoryId, setCategoryId] = useState('')
  const [familyId, setFamilyId] = useState('')

  const filters = useMemo(() => ({
    categoryId,
    familyId,
    hasActiveFilters: Boolean(categoryId || familyId),
  }), [categoryId, familyId])

  return {
    ...filters,
    setCategoryId,
    setFamilyId,
    resetFilters: () => {
      setCategoryId('')
      setFamilyId('')
    },
  }
}

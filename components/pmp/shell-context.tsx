"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ShellCtx = {
  right: ReactNode
  setRight: (node: ReactNode) => void
  searchPlaceholder: string
  setSearchPlaceholder: (s: string) => void
}

const Ctx = createContext<ShellCtx | null>(null)

export function ShellProvider({ children }: { children: ReactNode }) {
  const [right, setRight] = useState<ReactNode>(null)
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Поиск по проектам, пользователям, сервисам…",
  )
  const value = useMemo(
    () => ({ right, setRight, searchPlaceholder, setSearchPlaceholder }),
    [right, searchPlaceholder],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useShell() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useShell outside ShellProvider")
  return ctx
}

/** Register right-panel content while mounted */
export function RightPanel({ children }: { children: ReactNode }) {
  const { setRight } = useShell()
  useEffect(() => {
    setRight(children)
    return () => setRight(null)
  }, [children, setRight])
  return null
}

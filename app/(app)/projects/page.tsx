"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/pmp/page-header"

type Project = {
  id: string
  code: string
  name: string
  description: string
  baseUrl: string
  capabilities: string[]
  status: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
  }, [])

  return (
    <div>
      <PageHeader
        title="Проекты"
        description="Сервисы экосистемы pnk. Можно добавлять новые коннекторы."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Link
            key={p.code}
            href={`/projects/${p.code}`}
            className="group rounded-[24px] bg-[#16181f] p-6 border border-white/[0.03] hover:border-[#0066ff]/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold text-[22px] tracking-[-0.02em]">{p.name}</p>
                <p className="mt-2 text-[14px] text-white/50 font-[family-name:var(--font-manrope)]">
                  {p.description}
                </p>
              </div>
              <ArrowRight className="text-white/30 group-hover:text-[#4d9fff] transition-colors" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.capabilities.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-[#24262e] px-3 py-1 text-[12px] text-white/60"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-white/35">{p.baseUrl}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

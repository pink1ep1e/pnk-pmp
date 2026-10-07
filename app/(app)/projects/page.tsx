"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, IdCard, Mail, Folder } from "@/lib/icons"
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

const ICONS: Record<string, React.ElementType> = {
  "pnk-id": IdCard,
  "pnk-mail": Mail,
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
        description="Сервисы экосистемы — подключай и управляй"
      />
      <div className="space-y-3">
        {projects.map((p) => {
          const Icon = ICONS[p.code] || Folder
          return (
            <Link
              key={p.code}
              href={`/projects/${p.code}`}
              className="group flex items-center gap-4 rounded-[18px] bg-[#1a1c22] p-4 md:p-5 hover:bg-[#1e2028] transition-colors"
            >
              <div className="h-12 w-12 rounded-[14px] bg-[#24262e] flex items-center justify-center text-white shrink-0">
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-[18px] tracking-[-0.02em]">
                    {p.name}
                  </p>
                  <span
                    className={
                      p.status === "healthy"
                        ? "text-[11px] text-[#3dd68c] font-semibold"
                        : "text-[11px] text-[#f5a524] font-semibold"
                    }
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-white/45 line-clamp-1">{p.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.capabilities.map((c) => (
                    <span
                      key={c}
                      className="rounded-[10px] bg-[#0f1115] px-2.5 py-1 text-[11px] text-white/50"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-white/25 group-hover:text-[#4d9fff] transition-colors shrink-0"
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

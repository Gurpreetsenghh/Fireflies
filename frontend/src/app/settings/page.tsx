"use client";

import { Topbar } from "@/components/layout/Topbar";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="h-14 border-b dark:border-slate-800 flex items-center px-6 bg-white dark:bg-slate-950 shrink-0">
        <h1 className="font-semibold text-lg">Settings</h1>
      </div>
      <div className="flex-1 overflow-auto p-6 max-w-4xl">
        
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50 border-b dark:border-slate-800 pb-2 mb-4">Profile</h2>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium">
                TU
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-50">Test User</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">test@example.com</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50 border-b dark:border-slate-800 pb-2 mb-4 flex items-center justify-between">
              Integrations
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Coming soon</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 opacity-60">
                <h3 className="font-medium">Zoom</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connect your Zoom account</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 opacity-60">
                <h3 className="font-medium">Google Meet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connect your Google account</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50 border-b dark:border-slate-800 pb-2 mb-4 flex items-center justify-between">
              Notifications
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Coming soon</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure email and Slack notifications for new summaries.</p>
          </section>
        </div>

      </div>
    </div>
  );
}

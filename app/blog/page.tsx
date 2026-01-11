'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { blogPosts } from './blogData';

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            HIPAT<span className="text-indigo-600">IA</span> <span className="text-slate-300">|</span> Blog
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16 space-y-4">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        Centro de Conocimiento
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Ideas que transforman el aula.
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Artículos sobre tecnología educativa, evaluación por competencias y el futuro de la docencia con IA.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                            <article className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full flex flex-col hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
                                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                    <BookOpen size={14} />
                                    {post.category}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 mt-20 py-12">
                <div className="max-w-5xl mx-auto px-6 text-center text-slate-400 text-sm">
                    <p>© 2026 HIPATIA Ecosistema. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

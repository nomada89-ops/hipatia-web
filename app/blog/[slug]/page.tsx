import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { blogPosts } from '../blogData';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return { title: 'No encontrado' };

    return {
        title: post.seoTitle || `${post.title} | Blog HIPATIA`,
        description: post.excerpt,
        keywords: post.keywords ? post.keywords.split(',') : undefined,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Progress Bar (Simulated with scroll listener would be better, but keeping simple for Server Component) */}

            <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} /> Volver al Blog
                    </Link>
                    <div className="text-sm font-black text-slate-900 tracking-tight">
                        HIPAT<span className="text-indigo-600">IA</span>
                    </div>
                </div>
            </header>

            <article className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header Article */}
                    <div className="text-center mb-12 space-y-6">
                        <div className="flex items-center justify-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                {post.category}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500 border-t border-b border-slate-100 py-4 w-fit mx-auto">
                            <span className="flex items-center gap-2"><User size={16} className="text-indigo-500" /> {post.author}</span>
                            <span className="flex items-center gap-2"><Calendar size={16} className="text-indigo-500" /> {post.date}</span>
                            <span className="flex items-center gap-2"><Clock size={16} className="text-indigo-500" /> {post.readTime}</span>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="prose prose-lg prose-slate prose-headings:font-black prose-headings:tracking-tight prose-indigo mx-auto overflow-hidden">
                        {/* Featured Image Embedded and Floated */}
                        {post.imageUrl && (
                            <div className="float-left mr-8 mb-4 w-1/3 rounded-xl overflow-hidden shadow-lg border border-slate-100 hidden md:block">
                                <img
                                    src={post.imageUrl}
                                    alt={post.imageAlt || post.title}
                                    className="w-full h-auto m-0"
                                />
                            </div>
                        )}

                        {/* Mobile view image (centered) */}
                        {post.imageUrl && (
                            <div className="w-full mb-8 rounded-xl overflow-hidden shadow-lg border border-slate-100 md:hidden">
                                <img
                                    src={post.imageUrl}
                                    alt={post.imageAlt || post.title}
                                    className="w-full h-auto m-0"
                                />
                            </div>
                        )}

                        <div
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </div>
            </article>
        </div>
    );
}

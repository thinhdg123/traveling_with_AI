import React from 'react';

export default async function MienTrungDetail({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    return (
        <div className="flex items-center justify-center h-screen text-white">
            <h1 className="text-2xl">Detail for: {slug}</h1>
        </div>
    );
}

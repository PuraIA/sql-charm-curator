
import React from 'react';

interface AdPlaceholderProps {
    slotId?: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    label?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ slotId, format = 'auto', className = '', label = 'Advertisement' }) => {
    return (
        <div className={`my-8 flex justify-center items-center bg-secondary/10 border border-border/50 rounded-lg p-4 min-h-[100px] ${className}`}>
            <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
                {/* In production, this would be the Google AdSense script */}
                <div className="w-full h-full min-w-[300px] min-h-[100px] bg-muted/20 animate-pulse flex items-center justify-center rounded">
                    <span className="text-muted-foreground/50 text-sm">Ad Space {slotId ? `(${slotId})` : ''}</span>
                </div>
            </div>
        </div>
    );
};

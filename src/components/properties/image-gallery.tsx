'use client'

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
    images: string[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handlePrevious = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
        }
    };

    const handleNext = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-elegant transition-all duration-300"
                        onClick={() => setSelectedIndex(index)}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <Image
                            src={image}
                            alt={`Property ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300 rounded-2xl" />
                    </div>
                ))}
            </div>

            <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
                <DialogContent className="max-w-4xl p-0 glass-effect border-border/50 overflow-hidden">
                    <div className="relative animate-scale-in aspect-video">
                        {selectedIndex !== null && (
                            <Image
                                src={images[selectedIndex]}
                                alt="Property"
                                fill
                                className="object-contain rounded-lg"
                            />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 glass-effect border border-border/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-300 hover:scale-110 z-50"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 glass-effect border border-border/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-300 hover:scale-110 z-50"
                            onClick={handlePrevious}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 glass-effect border border-border/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-300 hover:scale-110 z-50"
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-effect border border-border/50 px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-md z-50">
                            {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

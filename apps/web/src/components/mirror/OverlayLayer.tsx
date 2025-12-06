"use client";

import React from "react";

const OverlayLayer = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="absolute inset-0 w-full h-full z-30 pointer-events-none">
            {/* This layer allows clicks to pass through to underlying elements if needed, 
          but usually UI elements here will capture events. 
          pointer-events-none on container, pointer-events-auto on children.
      */}
            <div className="relative w-full h-full p-8 flex flex-col justify-between pointer-events-none">
                {children}
            </div>
        </div>
    );
};

export default OverlayLayer;

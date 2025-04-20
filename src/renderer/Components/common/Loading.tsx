import React from 'react';


const Loading: React.FC = () => {
    return (
        <div
            className={"flex flex-col gap-3"}
            style={{
                position: 'absolute',
                background: '#00000099',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh'
            }}
        >
            <div className="bg-white animate-spin h-10 w-10 border-4 border-red-500" />
            <p className={"text-white"}>처리중입니다...</p>
        </div>
    );
}

export default Loading;

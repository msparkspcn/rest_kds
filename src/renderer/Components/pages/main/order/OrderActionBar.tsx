import React from "react";
import {STRINGS} from "../../../../constants/strings";

interface OrderActionBarProps {
    orderCnt: number;
}

const OrderActionBar: React.FC<OrderActionBarProps> = ({ orderCnt }) => {

    return (
        <footer className="flex w-full flex-row flex-wrap items-center
        justify-center gap-y-6 border-t bg-gray-200 border-blue-gray-50 py-2 text-center md:justify-between">
            <button type="button"
                    className="py-2.5 px-5 ml-2 text-2xl font-medium focus:outline-none bg-blue-500 rounded-lg border border-gray-200 hover:bg-gray-100
                    hover:text-blue-700 focus:z-10 ring-2 ring-gray-200 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 text-white
                    dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                임의호출
            </button>
            <button type="button"
                    className="py-2.5 px-8 text-2xl font-medium focus:outline-none bg-orange-400 rounded-lg border border-gray-200 hover:bg-gray-100
                    hover:text-blue-700 focus:z-10 ring-2 ring-gray-200 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 text-white
                    dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                품절
            </button>
            <div className="flex items-center justify-center">
                <div className="me-2 ml-2 text-white text-right" style={{ whiteSpace: "pre-line" }}>
                    {STRINGS.selected_order_no}
                </div>
                <button type="button"
                        className="py-2 px-10 me-2 text-3xl font-medium focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-100
                    hover:text-blue-700 focus:z-10 dark:bg-gray-800 dark:text-gray-400 text-black dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                    1
                </button>
            </div>
            <button type="button"
                    className="py-2.5 px-6 text-2xl font-medium focus:outline-none bg-blue-500 rounded-lg border border-gray-200 hover:bg-gray-100
                    hover:text-blue-700 focus:z-10 ring-2 ring-gray-200 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 text-white
                    dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                Call(호출)
            </button>
            <button type="button"
                    className="py-2.5 px-11 text-2xl font-medium focus:outline-none bg-orange-400 rounded-lg border border-gray-200 hover:bg-gray-100
                    hover:text-blue-700 focus:z-10 ring-2 ring-gray-200 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 text-white
                    dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                완료
            </button>
            <div className="flex items-center justify-center">
                <div className="me-2 ml-2 text-white text-right" style={{ whiteSpace: "pre-line" }}>
                    {STRINGS.total_order_cnt}
                </div>
                <button type="button"
                        className="py-2 px-8 me-2 text-3xl font-medium focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-100
                    hover:text-blue-700 focus:z-10 dark:bg-gray-800 dark:text-gray-400 text-black dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                    {orderCnt}
                </button>
            </div>
        </footer>
        )
}

export default OrderActionBar;

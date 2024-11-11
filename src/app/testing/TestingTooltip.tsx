import { useEffect } from "react";
import { useMisc } from "../../context/MiscContext";
import { applyTooltip, qSA } from "../../helper/helper";

export default function TestingTooltip() {
    const miscState = useMisc()
    const [data_1, data_2, data_3, data_4] = [
        'terlele bakar terlele bakar',
        'terlele bakar terlele bakar terlele bakar terlele bakar ',
        'terlele bakar terlele bakar terlele bakar terlele bakar terlele bakar terlele bakar ',
        'terlele bakar terlele bakar terlele bakar terlele bakar terlele bakar terlele bakar terlele bakar '
    ]

    useEffect(() => {
        qSA('[data-tooltip]').forEach((el: HTMLElement) => {
            // mouse event
            el.onpointerover = ev => applyTooltip(ev as any)
            el.onpointerout = ev => applyTooltip(ev as any)
            // touch event
            el.ontouchstart = ev => applyTooltip(ev as any)
            el.ontouchend = ev => applyTooltip(ev as any)
        })
    }, [])

    return (
        <table className="w-full h-[calc(100vh-3.75rem)] text-center">
            <tbody>
                <tr className="bg-blue-800">
                    {/* 75 */}
                    <td data-tooltip={data_3} className="relative border-2"> lele </td>
                    <td> lele </td>
                    <td data-tooltip={data_1} className="relative border-2"> lele </td>
                    <td> lele </td>
                    {/* 50 */}
                    <td data-tooltip={data_2} className="relative border-2"> lele </td>
                </tr>
                <tr className="bg-pink-800">
                    <td> awiwi </td>
                    <td>   </td>
                    <td>   </td>
                    <td>   </td>
                    <td> awiwi </td>
                </tr>
                <tr className="bg-green-800">
                    <td data-tooltip={data_1} className="relative border-2"> awiwi </td>
                    {/* 50 */}
                    <td data-tooltip={data_2} className="relative border-2"> awiwi </td>
                    {/* 75 */}
                    <td data-tooltip={data_3} className="relative border-2"> awiwi </td>
                    {/* 100 */}
                    <td data-tooltip={data_4} className="relative border-2"> awiwi </td>
                    <td> awiwi </td>
                </tr>
                <tr className="bg-slate-800">
                    <td> lele </td>
                    <td>   </td>
                    <td>   </td>
                    <td>   </td>
                    <td> lele </td>
                </tr>
                <tr className="bg-orange-800">
                    <td> awiwi </td>
                    <td data-tooltip={data_1} className="relative border-2"> awiwi </td>
                    {/* 50 */}
                    <td data-tooltip={data_2} className="relative border-2"> awiwi </td>
                    {/* 75 */}
                    <td data-tooltip={data_3} className="relative border-2"> awiwi </td>
                    {/* 100 */}
                    <td data-tooltip={data_4} className="relative border-2"> awiwi </td>
                </tr>
            </tbody>
        </table>
    )
}
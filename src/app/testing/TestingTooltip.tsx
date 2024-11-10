import Tooltip from "../../components/Tooltip";
import { useMisc } from "../../context/MiscContext";
import { ITooltip } from "../../helper/types";

export default function TestingTooltip() {
    const miscState = useMisc()
    const testingOptions: ITooltip = {
        text: 'board: normal;dice: 2;start: 75k;lose: -25k;mode: 5 laps;curse: 5%',
        key: '#testing',
        pos: 'bottom',
        arrow: ['top', 'middle']
    }
    const testingOptions2: ITooltip = {
        text: 'testing tooltip ampas yang ngebug mulu yteam',
        key: '#testing2',
        pos: 'top',
        arrow: ['bottom', 'middle']
    }

    return (
        <table className="w-full h-[calc(100vh-3.75rem)] text-center">
            <tbody>
                <tr className="bg-blue-800">
                    <td data-tooltip={testingOptions.text.replaceAll(';', '\n')} className="relative"> lele </td>
                    <td> lele </td>
                    <td> lele </td>
                    <td> lele </td>
                    <td> lele </td>
                </tr>
                <tr className="bg-pink-800">
                    <td> awiwi </td>
                    <td>   </td>
                    <td>   </td>
                    <td>   </td>
                    <td> awiwi </td>
                </tr>
                <tr className="bg-green-800">
                    <td> awiwi </td>
                    <td> awiwi </td>
                    <td data-tooltip={testingOptions.text.replaceAll(';', '\n')} 
                    className="relative tooltip-left tooltip-left-lg border-2"> awiwi </td>
                    <td> awiwi </td>
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
                    <td> awiwi </td>
                    <td> awiwi </td>
                    <td> awiwi </td>
                    <td data-tooltip={testingOptions.text.replaceAll(';', '\n')} className="relative"> awiwi </td>
                </tr>
            </tbody>
        </table>
    )
}
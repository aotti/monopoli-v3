export default function ResultMessage({ id }: {id: string}) {
    return (
        <div className="flex justify-between">
            {/* error = text-red-300 | success = text-green-300 */}
            <p id={id} className="mx-auto text-center"></p>
        </div>
    )
}
import { useState } from "react"
import api_list from "./config/api-docs.json"
import { ApiDocData } from "../../helper/types"

export default function DocsContent() {
    const apiList = api_list.list
    const [currentApiDoc, setCurrentApiDoc] = useState('/')

    return (
        <div className="text-center">
            {/* title */}
            <div className="text-orange-400 my-1">
                <h1> api docs </h1>
            </div>
            {/* tabs */}
            <div className="flex justify-around border-b">
                {apiList.map((v,i) => 
                    <button key={i} type="button" className="w-full py-2 hover:bg-darkblue-3 active:bg-darkblue-3"
                    onClick={() => setCurrentApiDoc(v.route as any)}> 
                        {v.route} 
                    </button>
                )}
            </div>
            {/* content */}
            <div className="grid grid-cols-4 bg-darkblue-1 h-[70vh] lg:h-[80vh] overflow-y-scroll p-1 text-left
            [&>*:nth-child(1n+5)]:border-t [&>*:nth-child(1n+5)]:pt-1">
                {apiList.map((v,i) => currentApiDoc == v.route
                    ? <ApiDoc data={v.data} />
                    : null
                )}
            </div>
        </div>
    )
}

function ApiDoc({ data }: {data: ApiDocData[]}) {
    
    return data.map((v,i) => 
        <div>
            <p className="text-balance"> [{v.for}] </p>
            <p className=""> {v.method} </p>
            {/* search query */}
            <div className="text-yellow-400">
                <p> query </p>
                <p className="whitespace-pre-line"> - {v.query.join('\n- ')} </p>
            </div>
            {/* headers */}
            <div className="text-yellow-400">
                <p> headers </p>
                <p className="whitespace-pre-line"> - {v.headers.join('\n- ')} </p>
            </div>
            {/* payload */}
            <div className="text-green-400">
                <p> payload </p>
                <p className="whitespace-pre-line"> - {v.body.join('\n- ')} </p>
            </div>
            {/* notes */}
            <div className="">
                <p> note: {v.note || '-'} </p>
            </div>
        </div>
    )
}
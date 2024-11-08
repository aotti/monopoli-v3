import { useGame } from "../../../../context/GameContext"
import { useMisc } from "../../../../context/MiscContext"
import { translateUI } from "../../../../helper/helper"

export default function HelpSection() {
    const miscState = useMisc()
    const gameState = useGame()

    return (
        <div className={`${gameState.gameSideButton == 'help' ? 'block' : 'hidden'}
        absolute top-[0vh] right-[calc(0rem+2.25rem)] lg:right-[calc(0rem+2.75rem)] 
        [writing-mode:horizontal-tb] p-1 overflow-y-scroll
        bg-darkblue-1 border-8bit-text w-[30vw] h-[calc(100%-1rem)]`}>
            <p className="text-xs lg:text-sm border-b-2 pb-1 mb-1">
                {translateUI({lang: miscState.language, text: 'help'})}
            </p>
            <ol className="text-left text-2xs lg:text-[10px]">
                {/* kartu dana umum */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> {translateUI({lang: miscState.language, text: 'Community Card'})} </summary>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'Gift from the bank, you get 40.000'})} </li>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'Your birthday, get 15.000 from each player'})} </li>
                        <li> [^25%] {translateUI({lang: miscState.language, text: 'You get an inheritance of 65.000'})} </li>

                        <li> [25%] {translateUI({lang: miscState.language, text: 'Gilang the hacker hacks your bank account and loses 20.000'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Fortune-blocking card, when you pass the start, you only get 5.000'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Your car is broken, pay 35.000 repair costs'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'Tax nerf card 35%'})} </li>
                        <li> [25%] {translateUI({lang: miscState.language, text: 'You get 20.000 times the number on the selected coin'})} </li>

                        <li> [15%] {translateUI({lang: miscState.language, text: 'Debt collectors come to your house, you pay 60.000 debt'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Pay the hospital 50.000'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'The kind Gilang gives you 5.000'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Select the city you want to go to'})} </li>
                        <li> [15%] {translateUI({lang: miscState.language, text: 'Anti-tax card'})} </li>

                        <li> [8%] {translateUI({lang: miscState.language, text: 'Monthly salary has been paid, you get 160.000'})} </li>
                        <li> [8%] {translateUI({lang: miscState.language, text: 'Pay electricity & water bills 100.000'})} </li>
                        <li> [8%] {translateUI({lang: miscState.language, text: 'Sell 1 owned city (random)'})} </li>
                        <li> [5%] {translateUI({lang: miscState.language, text: 'City upgrade card'})} </li>
                </details>
                {/* kartu kesempatan */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> Kartu Kesempatan </summary>
                        <li> [^25%] Kaki anda tersandung, maju 1 langkah </li>
                        <li> [^25%] Anda menemukan uang 50.000 di jalan, ambil uang atau maju 2 langkah </li>
                        <li> [^25%] Anda menemukan uang 30.000 di kantong celana </li>
                        <li> [25%] Renovasi rumah, bayar 30% dari total uang </li>
                        <li> [25%] Anda lari dikejar biawak, mundur 2 langkah </li>
                        <li> [25%] Pilih maju sampai start atau ambil kartu dana umum </li>
                        <li> [25%] Kartu dadu gaming, mendapat uang Rp 10.000 dikali angka kocok dadu </li>
                        <li> [25%] Upgrade 1 kota yang anda miliki (acak) </li>
                        <li> [15%] Menuju kota punya orang lain </li>
                        <li> [15%] Gilang menjatuhkan ichi ochanya, anda harus mundur 3 langkah untuk mengembalikannya </li>
                        <li> [15%] Adu nasib, masuk parkir bebas atau masuk penjara </li>
                        <li> [15%] Kartu nerf parkir sabeb </li>
                        <li> [15%] Gempa bumi, 1 bangunan roboh #menangid </li>
                        <li> [8%] Anda tertangkap basah korupsi, masuk penjara & denda 90% dari total uang </li>
                        <li> [8%] Kartu bebas penjara </li>
                        <li> [8%] Anda mendapatkan uang kaget sebanyak 200.000 </li>
                        <li> [5%] Kartu upgrade kota </li>
                </details>
                {/* efek kartu */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> Efek Kartu </summary>
                        <li className="text-red-400"> Semua kartu hanya 1x pakai lalu hangus </li>
                        <li className="text-red-400"> Tidak bisa punya 2 kartu yg sama, kalo kau punya kartu anti pajak lalu dapat lagi, tetap dihitung 1 </li>
                        <li> Bebas Penjara = ya sesuai namanya lah ya... #h3h3 </li>
                        <li> Anti Pajak = kalo kaw menginjak kota orang lain, maka tak bayar pajak </li>
                        <li> Nerf Pajak = pajak saat injak kota orang lain dikurangi 35% :sunglasses: </li>
                        <li> Dadu Gaming = mendapat uang 10k dikali jumlah kocok dadu </li>
                        <li> Nerf Dadu Gaming = mendapat uang 5k dikali jumlah kocok dadu </li>
                        <li> Sad Dadu Gaming = uang berkurang 5k dikali jumlah kocok dadu </li>
                        <li> Nerf Parkir = daftar petak yg bisa dipilih saat masuk parkir bebas berkurang 40% </li>
                        <li> Penghambat Rezeki = saat lewat start hanya mendapat uang 5k </li>
                        <li> Upgrade Kota = bisa beli rumah tanpa harus mampir ke kotanya (tapi random h3h3) </li>
                </details>
                {/* buff debuff */}
                <details className="my-2 cursor-pointer">
                    <summary className="text-[10px] lg:text-xs text-green-400"> Area Buff/Debuff </summary>
                        <li> Area Normal (65% dapat bonus)
                        <ul className="list-disc">
                            <li> [25%] Maju 1 langkah </li>
                            <li> [15%] Maju 2 langkah </li>
                            <li> [10%] Kartu nerf dadu gaming </li>
                            <li> [8%] Kartu nerf parkir </li>
                            <li> [7%] Maju ke petak normal selanjutnya </li>
                        </ul>
                        </li>
                        <li> Area Buff (100% dapat bonus)
                        <ul className="list-disc">
                            <li> [35%] Dapat uang 5k x jml putaran </li>
                            <li> [10%] Kartu upgrade kota </li>
                            <li> [35%] Kartu nerf dadu gaming / pajak </li>
                            <li> [20%] Kartu bebas penjara </li>
                        </ul>
                        </li>
                </details>
            </ol>
        </div>
    )
}
export default async function Confirm({ params }: { params: { bid: string } }){

    return (
        <div className="bg-[url(/img/ConfirmBg.png)] bg-fixed bg-center bg-cover w-screen h-screen flex justify-center">
            <div className="bg-white text-center w-4/5 h-3/4 shadow-md">
                {params.bid}
            </div>
        </div>
    );
}
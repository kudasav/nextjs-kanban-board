import BarLoader from "react-spinners/BarLoader";

export default function Loader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-5">
                <img className="h-[50px] w-auto m-auto mb-5" src="/brand.png" />
                <BarLoader
                    color="#05044a"
                    loading={true}
                    width={180}
                    aria-label="Loading"
                    data-testid="loader"
                />
            </div>
        </div>
    )
}
export function App ({ studioKey }: {studioKey: string}) {
    return (
        <div className="rounded-x1 border border-gray-200 p-4">
            <button className="rounded-lg bg-orange-600 px-4 py-2 text-white">
                Hello Daisy - {studioKey}
            </button>
        </div>
    );
}
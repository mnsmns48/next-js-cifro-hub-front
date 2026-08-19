import {redirect} from "next/navigation";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ menu?: string | string[] }>;
}) {
    const params = await searchParams;
    const menu = Array.isArray(params.menu) ? params.menu[0] : params.menu;

    if (menu) {
        redirect(`/catalog?menu=${encodeURIComponent(menu)}`);
    }

    redirect("/catalog");
}

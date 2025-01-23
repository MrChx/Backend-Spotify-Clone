import { Album } from "../model/album-model";
import { Song } from "../model/song-model";
import { User } from "../model/user-model";

export const getStats = async (req, res, next) => {
    try {
        const [totalSongs, totalAlbums, totalUsers, uniqueArtists] = await Promise.all([ //mengambil daya secara paralel
			Song.countDocuments(), //menghitung dokumen
			Album.countDocuments(),
			User.countDocuments(),

			Song.aggregate([ //menghitung artis yang unik
				{
					$unionWith: {
						coll: "albums",
						pipeline: [],
					},
				},
				{
					$group: {
						_id: "$artist",
					},
				},
				{
					$count: "count",
				},
			]),
		]);

		res.status(200).json({
			totalAlbums,
			totalSongs,
			totalUsers,
			totalArtists: uniqueArtists[0]?.count || 0,
		});
    } catch (error) {
        next(error);
    }
};
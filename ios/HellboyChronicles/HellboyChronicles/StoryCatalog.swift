import Foundation

enum StoryCatalog {
    static let stories: [Story] = [
        Story(
            id: "turnip",
            title: "The Turnip",
            ukrainianTitle: "Ріпка",
            subtitle: "The strength of every hand",
            ukrainianSubtitle: "Сила кожної руки",
            englishBody: """
            In a small whitewashed house beside a wide field lived a grandfather and grandmother who cared for their garden from the first thaw until the autumn frost.

            One spring morning Grandfather pressed a turnip seed into the dark earth. “Grow sweet, grow strong, and grow big enough for everyone,” he said, patting the soil flat with his palm.

            Rain crossed the field in silver curtains, sunlight warmed the rows, and the turnip grew. Its leaves became broad as umbrellas. Its golden shoulder rose from the ground like a moon.

            By harvest time Grandfather declared that one turnip would feed the household for days. He seized the leaves and pulled, but the turnip did not move.

            Grandmother wrapped her arms around Grandfather. Their granddaughter held Grandmother; the little dog gripped the girl’s apron; the cat caught the dog’s tail. They pulled to a steady rhythm—one, two, three—and still the stubborn root held fast.

            The mouse watched from beneath the fence while the others laughed at the thought that such a tiny creature might help. Yet the mouse stepped forward. She caught the cat’s tail, planted her small feet, and squeaked, “Together!”

            The whole line leaned back. The soil cracked, the leaves trembled, and the enormous turnip flew free. Everyone tumbled into a laughing heap while the mouse sat proudly on top.

            That evening the pot simmered with fragrant turnip stew. Grandfather gave the first spoonful to the mouse. No one at the table forgot the lesson of the harvest: a task too great for one may become easy when every hand, paw, and tiny set of whiskers joins the work.
            """,
            ukrainianBody: """
            У невеликій біленій хатині біля широкого поля жили дід і баба. Від першої відлиги до осіннього морозу вони доглядали город.

            Одного весняного ранку дід поклав у темну землю насінину ріпки. «Рости солодка, рости міцна, рости велика — щоб усім вистачило», — сказав він і долонею пригладив ґрунт.

            Дощі срібними завісами переходили поле, сонце гріло грядки, а ріпка все росла. Її листя стало широким, мов парасолі, а золоте плече піднялося над землею, наче місяць.

            Восени дід ухопився за гичку й потягнув, та ріпка навіть не ворухнулася.

            Баба обхопила діда, онучка — бабу, песик учепився за фартух онучки, а кіт — за хвіст песика. Тягнули рівно: раз, два, три, але впертий корінь тримався.

            Мишка визирала з-під тину, а великі помічники засміялися: невже така крихітка щось змінить? Та мишка стала позаду, вхопила кота за хвіст і пискнула: «Разом!»

            Усі разом відхилилися назад. Земля тріснула, листя затремтіло, і величезна ріпка вилетіла з грядки. Уся вервечка впала в веселу купу, а мишка опинилася зверху.

            Увечері в горщику пахла юшка з ріпи. Першу ложку дід подав мишці. Відтоді ніхто в хаті не забував: справа, непосильна для одного, стає легкою, коли до неї долучаються кожна рука, кожна лапка й навіть найменші вусики.
            """
        ),
        Story(
            id: "mitten",
            title: "The Mitten",
            ukrainianTitle: "Рукавичка",
            subtitle: "A winter home with room for kindness",
            ukrainianSubtitle: "Зимова оселя, де вистачає доброти",
            englishBody: """
            On the coldest morning of winter, an old man walked through the forest with his dog. Snow gathered on the pine branches and softened every sound. As he reached for his walking stick, one woolen mitten slipped from his belt and vanished into a drift.

            A mouse found the mitten first. She crept inside, shook snow from her whiskers, and called it a palace. Soon a frog knocked at the cuff, followed by a rabbit with frozen ears. “There is little room,” said the mouse, “but kindness can make a small place larger.”

            A fox arrived, then a gray wolf, and after him a wild boar whose bristles scraped the seams. Each animal promised to sit carefully. At last a great bear lumbered from the trees. The mitten groaned when he placed one paw inside, yet the animals shuffled, folded, and made him a corner near the thumb.

            The old man finally noticed his bare hand and sent the dog back along their tracks. The dog followed the old scent until he saw the mitten jumping, snoring, and bulging in the snow. He barked once in surprise.

            Out burst the mouse, frog, rabbit, fox, wolf, boar, and bear, scattering like sparks into the white forest.

            The old man picked up the warm, stretched mitten and wondered how it had grown so large. Far among the trees, seven unlikely neighbors remembered the shelter they had shared. Whenever winter winds returned, they greeted one another as friends who knew that warmth multiplies when it is offered.
            """,
            ukrainianBody: """
            Найхолоднішого зимового ранку дід ішов лісом із собакою. Сніг лежав на соснових гілках і приглушував кожен звук. Коли дід поправив палицю, одна вовняна рукавичка зісковзнула з пояса й упала в замет.

            Першою рукавичку знайшла мишка. Вона залізла всередину, струсила сніг із вусів і назвала її палацом. Незабаром у манжету постукала жабка, а за нею прибіг зайчик із замерзлими вухами. «Місця мало, — сказала мишка, — але доброта вміє розширювати найменшу оселю».

            Прийшла лисичка, потім сірий вовк і дикий кабан, чия щетина дряпала шви. Кожен обіцяв сидіти обережно. Нарешті з-за дерев вийшов ведмідь. Рукавичка застогнала, коли він просунув лапу, та звірі посунулися й знайшли йому куточок біля великого пальця.

            Дід помітив голу руку й послав собаку назад по слідах. Пес відчув знайомий запах і побачив, як рукавичка стрибає та хропе посеред снігу. Він гавкнув від подиву.

            Мишка, жабка, зайчик, лисичка, вовк, кабан і ведмідь вискочили назовні та розбіглися білими хащами.

            Дід підняв теплу, розтягнуту рукавичку й дивувався, чому вона стала такою великою. А семеро сусідів у лісі пам’ятали спільний прихисток. Відтоді вони віталися як друзі, які знають: подароване тепло не зменшується — його стає більше.
            """
        )
    ]
}
